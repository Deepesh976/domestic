import OrgUser from '../../models/OrgUser.js';

/* =====================================================
   HEAD ADMIN – CUSTOMER CONTROLLER
   NEW RULES:
   - Organization isolation via org_id
   - Customer KYC is only for profile display
   - Installation Order controls approval workflow
===================================================== */


/* =========================
   GET ALL CUSTOMERS (ORG-SCOPED)
========================= */
export const getCustomers = async (req, res) => {
  try {
    const org_id = req.user.organization;

    if (!org_id) {
      return res.status(403).json({
        message: 'Organization access denied',
      });
    }

    const customers = await OrgUser.find({ org_id })
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      count: customers.length,
      customers,
    });
  } catch (error) {
    console.error('❌ Get Customers Error:', error);
    res.status(500).json({
      message: 'Failed to fetch customers',
    });
  }
};


/* =========================
   UPLOAD CUSTOMER KYC IMAGE
   - Sets status to "pending"
   - Does NOT sync installation
========================= */
export const uploadCustomerKyc = async (req, res) => {
  try {
    const org_id = req.user.organization;
    const customer_id = req.params.id;
    const { doc_type } = req.body;

    if (!req.file) {
      return res.status(400).json({
        message: 'KYC image is required',
      });
    }

    const customer = await OrgUser.findOneAndUpdate(
      {
        _id: customer_id,
        org_id,
      },
      {
        $set: {
          'kyc_details.doc_type': doc_type || '',
          'kyc_details.doc_image': req.file.filename,
          'kyc_details.kyc_approval_status': 'pending',
        },
      },
      { new: true }
    );

    if (!customer) {
      return res.status(404).json({
        message: 'Customer not found or access denied',
      });
    }

    return res.status(200).json({
      message: 'Customer KYC uploaded successfully',
      customer,
    });
  } catch (error) {
    console.error('❌ Upload Customer KYC Error:', error);
    return res.status(500).json({
      message: 'Failed to upload customer KYC',
    });
  }
};


/* =========================
   UPDATE CUSTOMER KYC STATUS
   - Profile-level only
   - Does NOT sync installation anymore
========================= */
export const updateKycStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const org_id = req.user.organization;
    const customer_id = req.params.id;

    const allowedStatuses = ['approved', 'pending', 'rejected'];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: 'Invalid KYC status',
      });
    }

    const customer = await OrgUser.findOneAndUpdate(
      {
        _id: customer_id,
        org_id,
      },
      {
        $set: {
          'kyc_details.kyc_approval_status': status,
        },
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!customer) {
      return res.status(404).json({
        message: 'Customer not found or access denied',
      });
    }

    res.status(200).json({
      message: 'Customer KYC status updated successfully',
      customer,
    });
  } catch (error) {
    console.error('❌ Update KYC Error:', error);
    res.status(500).json({
      message: 'Failed to update KYC status',
    });
  }
};


/* =========================
   UPDATE DEVICE STATUS
   allowed: linked | unlinked | declined
========================= */
export const updateDeviceStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const org_id = req.user.organization;
    const customer_id = req.params.id;

    const allowedStatuses = ['linked', 'unlinked', 'declined'];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: 'Invalid device status',
      });
    }

    const customer = await OrgUser.findOneAndUpdate(
      {
        _id: customer_id,
        org_id,
      },
      {
        $set: {
          user_device_status: status,
        },
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!customer) {
      return res.status(404).json({
        message: 'Customer not found or access denied',
      });
    }

    res.status(200).json({
      message: 'Device status updated successfully',
      customer,
    });
  } catch (error) {
    console.error('❌ Update Device Error:', error);
    res.status(500).json({
      message: 'Failed to update device status',
    });
  }
};