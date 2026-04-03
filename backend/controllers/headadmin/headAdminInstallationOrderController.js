import InstallationOrder from '../../models/InstallationOrder.js';
import OrgUser from '../../models/OrgUser.js';
import OrgTechnician from '../../models/OrgTechnician.js';
import Plan from '../../models/Plan.js';

/* =====================================================
   GET INSTALLATION ORDERS (HEAD ADMIN)
===================================================== */
export const getInstallationOrders = async (req, res) => {
  try {
    const org_id = req.user.organization;

    const orders = await InstallationOrder.find({ org_id })
      .sort({ createdAt: -1 })
      .lean();

    const users = await OrgUser.find({ org_id })
      .select('user_id user_name')
      .lean();

    const technicians = await OrgTechnician.find({ org_id })
      .select('user_id user_name')
      .lean();

    const plans = await Plan.find({ org_id })
      .select('plan_id name')
      .lean();

    const userMap = {};
    users.forEach((u) => {
      userMap[u.user_id] =
        `${u.user_name?.first_name || ''} ${u.user_name?.last_name || ''}`.trim();
    });

    const technicianMap = {};
    technicians.forEach((t) => {
      technicianMap[t.user_id] =
        `${t.user_name?.first_name || ''} ${t.user_name?.last_name || ''}`.trim();
    });

    const planMap = {};
    plans.forEach((p) => {
      planMap[p.plan_id] = p.name;
    });

    const enrichedOrders = orders.map((order) => ({
      ...order,
      customer_name: userMap[order.user_id] || 'Unknown Customer',
      plan_name: planMap[order.plan_id] || 'Unknown Plan',
      payment_received: order.stages?.payment_received === true,
      kyc_status: order.kyc_approval_status || 'PENDING',
      technician_name: order.assigned_to
        ? technicianMap[order.assigned_to] || null
        : null,
    }));

    res.status(200).json(enrichedOrders);

  } catch (error) {
    console.error('🔥 getInstallationOrders:', error);
    res.status(500).json({
      message: 'Failed to fetch installation orders',
    });
  }
};

/* =====================================================
   UPDATE INSTALLATION KYC STATUS
===================================================== */
export const updateInstallationKycStatus = async (req, res) => {
  try {
    const { kyc_approval_status: status } = req.body;
    const org_id = req.user.organization;
    const { id } = req.params;

    const allowedStatuses = ['APPROVED', 'REJECTED', 'PENDING'];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: 'Invalid KYC status',
      });
    }

    const order = await InstallationOrder.findOne({ _id: id, org_id });

    if (!order) {
      return res.status(404).json({
        message: 'Order not found',
      });
    }

    /* ---------- Update Order ---------- */

    order.kyc_approval_status = status;

    if (!order.stages) order.stages = {};

    order.stages.kyc_verified = status === 'APPROVED';

    await order.save();

    /* ---------- Update User KYC (SAFE) ---------- */

    try {
      const user = await OrgUser.findOne({
        user_id: order.user_id,
        org_id,
      });

      if (user) {
        if (!user.kyc_details) {
          user.kyc_details = {};
        }

        user.kyc_details.kyc_approval_status = status;

        await user.save();
      }
    } catch (userError) {
      console.error('⚠ User KYC update failed:', userError);
      // Do NOT crash main API
    }

    res.status(200).json({
      message: 'KYC status updated successfully',
    });

  } catch (error) {
    console.error('🔥 updateInstallationKycStatus:', error);
    res.status(500).json({
      message: 'Failed to update KYC status',
    });
  }
};

/* =====================================================
   ASSIGN TECHNICIAN
===================================================== */
export const assignInstallationTechnician = async (req, res) => {
  try {
    const org_id = req.user.organization;
    const { technician_id } = req.body;

    if (!technician_id) {
      return res.status(400).json({
        message: 'technician_id is required',
      });
    }

    const technician = await OrgTechnician.findOne({
      _id: technician_id,
      org_id,
      is_active: true,
    });

    if (!technician) {
      return res.status(400).json({
        message: 'Technician not found or inactive',
      });
    }

    const order = await InstallationOrder.findOne({
      _id: req.params.id,
      org_id,
    });

    if (!order) {
      return res.status(404).json({
        message: 'Order not found',
      });
    }

    if (order.status !== 'OPEN') {
      return res.status(400).json({
        message: 'Order is not in OPEN state',
      });
    }

    if (!order.stages?.payment_received) {
      return res.status(400).json({
        message: 'Payment not received',
      });
    }

    if (order.kyc_approval_status !== 'APPROVED') {
      return res.status(400).json({
        message: 'KYC must be approved before assigning technician',
      });
    }

    if (order.technician_approval_status === 'PENDING') {
      return res.status(400).json({
        message: 'Technician already assigned and awaiting approval',
      });
    }

    order.assigned_to = technician.user_id;
    order.technician_approval_status = 'PENDING';
    order.stages.technician_assigned = false;

    await order.save();

    res.status(200).json({
      message: 'Technician assigned successfully',
    });

  } catch (error) {
    console.error('🔥 assignInstallationTechnician:', error);
    res.status(500).json({
      message: 'Failed to assign technician',
    });
  }
};

/* =====================================================
   REMOVE TECHNICIAN ASSIGNMENT
===================================================== */
export const removeTechnicianAssignment = async (req, res) => {
  try {
    const org_id = req.user.organization;
    const { id } = req.params;

    const order = await InstallationOrder.findOne({
      _id: id,
      org_id,
    });

    if (!order) {
      return res.status(404).json({
        message: 'Order not found',
      });
    }

    if (order.technician_approval_status !== 'PENDING') {
      return res.status(400).json({
        message: 'Cannot remove assignment after approval or rejection',
      });
    }

    order.assigned_to = null;
    order.technician_approval_status = null;
    order.stages.technician_assigned = false;

    await order.save();

    res.status(200).json({
      message: 'Technician assignment removed successfully',
    });

  } catch (error) {
    console.error('🔥 removeTechnicianAssignment:', error);
    res.status(500).json({
      message: 'Failed to remove technician assignment',
    });
  }
};

/* =====================================================
   COMPLETE INSTALLATION
===================================================== */
export const completeInstallation = async (req, res) => {
  try {
    const org_id = req.user.organization;
    const { id } = req.params;

    const order = await InstallationOrder.findOne({
      _id: id,
      org_id,
    });

    if (!order) {
      return res.status(404).json({
        message: 'Order not found',
      });
    }

    order.stages.installation_completed = true;
    order.completed_at = new Date();
    order.status = 'CLOSED';

    await order.save();

    res.status(200).json({
      message: 'Installation completed successfully',
    });

  } catch (error) {
    console.error('🔥 completeInstallation:', error);
    res.status(500).json({
      message: error.message,
    });
  }
};