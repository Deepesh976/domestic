import OrgUser from '../../models/OrgUser.js';

/* =====================================================
   HEAD ADMIN – CUSTOMER CONTROLLER (FINAL WORKING)
===================================================== */


/* =========================
   CREATE CUSTOMER
========================= */
export const createCustomer = async (req, res) => {
  try {
    const org_id = req.user.organization;

    if (!org_id) {
      return res.status(403).json({
        message: 'Organization access denied',
      });
    }

    const { name, email, phone, address } = req.body;

    if (!name || !email || !phone) {
      return res.status(400).json({
        message: 'Name, email and phone are required',
      });
    }

    /* =========================
       🔥 SPLIT NAME FIX
    ========================= */
    const nameParts = name.trim().split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    /* =========================
       CREATE USER
    ========================= */
    const newCustomer = await OrgUser.create({
      org_id,

      email_address: email,
      phone_number: phone,

      user_name: {
        first_name: firstName,
        last_name: lastName,
      },

address: {
  line: address?.line || '',
  street: address?.street || '',
  area: address?.area || '',
  city: address?.city || '',
  state: address?.state || '',
  code: address?.code || '',
  country: address?.country || 'India',
},
    });

    res.status(201).json({
      message: 'Customer created successfully',
      customer: newCustomer,
    });

  } catch (error) {
    console.error('❌ Create Customer Error:', error);
    res.status(500).json({
      message: 'Failed to create customer',
    });
  }
};

/* =========================
   GET ALL CUSTOMERS (LATEST FIRST)
========================= */
export const getCustomers = async (req, res) => {
  try {
    const org_id = req.user.organization;

    const customers = await OrgUser.find({ org_id })
      .sort({ createdAt: -1 }) // 🔥 latest on top
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
   GET SINGLE CUSTOMER
========================= */
export const getCustomerById = async (req, res) => {
  try {
    const org_id = req.user.organization;
    const { id } = req.params;

    const customer = await OrgUser.findOne({ _id: id, org_id });

    if (!customer) {
      return res.status(404).json({
        message: 'Customer not found',
      });
    }

    res.status(200).json(customer);

  } catch (error) {
    console.error('❌ Get Customer Error:', error);
    res.status(500).json({
      message: 'Failed to fetch customer',
    });
  }
};


/* =========================
   DELETE CUSTOMER
========================= */
export const deleteCustomer = async (req, res) => {
  try {
    const org_id = req.user.organization;
    const { id } = req.params;

    const customer = await OrgUser.findOneAndDelete({
      _id: id,
      org_id,
    });

    if (!customer) {
      return res.status(404).json({
        message: 'Customer not found',
      });
    }

    res.status(200).json({
      message: 'Customer deleted successfully',
    });

  } catch (error) {
    console.error('❌ Delete Error:', error);
    res.status(500).json({
      message: 'Failed to delete customer',
    });
  }
};


/* =========================
   UPDATE KYC STATUS
========================= */
export const updateKycStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const org_id = req.user.organization;
    const { id } = req.params;

    const allowedStatuses = ['approved', 'pending', 'rejected'];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: 'Invalid KYC status',
      });
    }

    const customer = await OrgUser.findOneAndUpdate(
      { _id: id, org_id },
      {
        $set: {
          'kyc_details.kyc_approval_status': status,
        },
      },
      { new: true }
    );

    res.status(200).json({
      message: 'KYC updated successfully',
      customer,
    });

  } catch (error) {
    console.error('❌ KYC Error:', error);
    res.status(500).json({
      message: 'Failed to update KYC',
    });
  }
};


/* =========================
   UPDATE DEVICE STATUS
========================= */
export const updateDeviceStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const org_id = req.user.organization;
    const { id } = req.params;

    const allowedStatuses = ['linked', 'unlinked', 'declined'];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: 'Invalid device status',
      });
    }

    const customer = await OrgUser.findOneAndUpdate(
      { _id: id, org_id },
      {
        $set: {
          user_device_status: status,
        },
      },
      { new: true }
    );

    res.status(200).json({
      message: 'Device status updated',
      customer,
    });

  } catch (error) {
    console.error('❌ Device Error:', error);
    res.status(500).json({
      message: 'Failed to update device status',
    });
  }
};


/* =========================
   UPLOAD CUSTOMER KYC ✅ (FIXED EXPORT)
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
      { _id: customer_id, org_id },
      {
        $set: {
          'kyc_details.doc_type': doc_type || '',
          'kyc_details.doc_image': req.file.filename,
          'kyc_details.kyc_approval_status': 'pending',
        },
      },
      { new: true }
    );

    res.status(200).json({
      message: 'KYC uploaded successfully',
      customer,
    });

  } catch (error) {
    console.error('❌ Upload KYC Error:', error);
    res.status(500).json({
      message: 'Failed to upload KYC',
    });
  }
};

export const updateCustomer = async (req, res) => {
  try {
    const org_id = req.user.organization;
    const { id } = req.params;
    const { name, email, phone, address } = req.body;

    /* =========================
       🔥 SPLIT NAME FIX
    ========================= */
    const nameParts = name.trim().split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    const updated = await OrgUser.findOneAndUpdate(
      { _id: id, org_id },
      {
        email_address: email,
        phone_number: phone,

        user_name: {
          first_name: firstName,
          last_name: lastName,
        },

address: {
  line: address?.line || '',
  street: address?.street || '',
  area: address?.area || '',
  city: address?.city || '',
  state: address?.state || '',
  code: address?.code || '',
  country: address?.country || 'India',
},
      },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "User updated successfully",
      customer: updated,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Update failed" });
  }
};