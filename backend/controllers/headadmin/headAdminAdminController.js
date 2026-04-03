import bcrypt from 'bcryptjs';
import OrgAdmin from '../../models/OrgAdmin.js';
import OrgHeadAdmin from '../../models/OrgHeadAdmin.js';

/* ======================================================
   GET ADMINS + HEADADMINS (SAME ORG ONLY)
====================================================== */
export const getAdmins = async (req, res) => {
  try {
    /* =========================
       RESOLVE ORG ID (JWT FIRST)
    ========================= */
    let orgId = req.user.organization;

    if (!orgId) {
      const headAdmin = await OrgHeadAdmin.findById(req.user.id);
      if (!headAdmin) {
        return res.status(401).json({
          message: 'Invalid head admin',
        });
      }
      orgId = headAdmin.org_id;
    }

    if (!orgId) {
      return res.status(401).json({
        message: 'Organization not found for user',
      });
    }

    /* =========================
       FETCH HEAD ADMINS
    ========================= */
    const headAdmins = await OrgHeadAdmin.find({
      org_id: orgId,
    })
      .select('-password')
      .sort({ createdAt: -1 });

    /* =========================
       FETCH ADMINS
    ========================= */
    const admins = await OrgAdmin.find({
      org_id: orgId,
    })
      .select('-password')
      .sort({ createdAt: -1 });

    /* =========================
       NORMALIZE RESPONSE
    ========================= */
    const users = [
      ...headAdmins.map((h) => ({
        _id: h._id,
        username: h.username,
        email: h.email,
        role: 'headadmin',
        phone_number: h.phone_number || '',
        flat_no: h.flat_no || '',
        area: h.area || '',
        city: h.city || '',
        state: h.state || '',
        country: h.country || '',
        postal_code: h.postal_code || '',
        kyc_details: h.kyc_details || {},
        createdAt: h.createdAt,
      })),
      ...admins.map((a) => ({
        _id: a._id,
        username: a.username,
        email: a.email,
        role: 'admin',
        phone_number: a.phone_number || '',
        flat_no: a.flat_no || '',
        area: a.area || '',
        city: a.city || '',
        state: a.state || '',
        country: a.country || '',
        postal_code: a.postal_code || '',
        kyc_details: a.kyc_details || {},
        createdAt: a.createdAt,
      })),
    ];

    return res.status(200).json({
      count: users.length,
      admins: users,
    });
  } catch (error) {
    console.error('❌ Get admins error:', error);
    return res.status(500).json({
      message: 'Failed to fetch admins',
    });
  }
};

/* ======================================================
   CREATE ADMIN (WITH KYC IMAGE)
====================================================== */
export const createAdmin = async (req, res) => {
  try {
    const {
      username,
      email,
      password,
      phone_number,
      flat_no,
      area,
      city,
      state,
      country,
      postal_code,
      doc_type,
      doc_detail,
    } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({
        message: 'username, email and password are required',
      });
    }

    /* =========================
       RESOLVE ORG
    ========================= */
    let orgId = req.user.organization;
    let organization;

    if (!orgId) {
      const headAdmin = await OrgHeadAdmin.findById(req.user.id).populate('organization');
      if (!headAdmin) {
        return res.status(401).json({ message: 'Invalid head admin' });
      }
      orgId = headAdmin.org_id;
      organization = headAdmin.organization;
    } else {
      const headAdmin = await OrgHeadAdmin.findOne({ org_id: orgId }).populate('organization');
      organization = headAdmin?.organization;
    }

    /* =========================
       DUPLICATE CHECK
    ========================= */
    const exists = await OrgAdmin.findOne({
      email,
      org_id: orgId,
    });

    if (exists) {
      return res.status(409).json({
        message: 'Admin already exists in this organization',
      });
    }

    // const hashedPassword = await bcrypt.hash(password, 10);

    const admin = await OrgAdmin.create({
      username,
      email,
      password: password,
      phone_number,
      flat_no,
      area,
      city,
      state,
      country,
      postal_code,
      role: 'admin',
      org_id: orgId,
      organization: organization?._id || organization,

      kyc_details: {
        doc_type,
        doc_detail,
        kyc_image: req.file ? req.file.filename : null,
        kyc_approval_status: 'pending',
      },
    });

    return res.status(201).json({
      message: 'Admin created successfully',
      admin,
    });
  } catch (error) {
    console.error('❌ Create admin error:', error);
    return res.status(500).json({
      message: 'Failed to create admin',
    });
  }
};

/* ======================================================
   UPDATE ADMIN (ORG SAFE)
====================================================== */
export const updateAdmin = async (req, res) => {
  try {
    let orgId = req.user.organization;

    if (!orgId) {
      const headAdmin = await OrgHeadAdmin.findById(req.user.id);
      if (!headAdmin) {
        return res.status(401).json({ message: 'Invalid head admin' });
      }
      orgId = headAdmin.org_id;
    }

    const updateData = { ...req.body };

    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 10);
    }

    if (req.file) {
      updateData['kyc_details.kyc_image'] = req.file.filename;
      updateData['kyc_details.kyc_approval_status'] = 'pending';
    }

    const admin = await OrgAdmin.findOneAndUpdate(
      {
        _id: req.params.adminId,
        org_id: orgId,
      },
      updateData,
      { new: true }
    ).select('-password');

    if (!admin) {
      return res.status(404).json({
        message: 'Admin not found for this organization',
      });
    }

    return res.status(200).json({
      message: 'Admin updated successfully',
      admin,
    });
  } catch (error) {
    console.error('❌ Update admin error:', error);
    return res.status(500).json({
      message: 'Failed to update admin',
    });
  }
};

/* ======================================================
   DELETE ADMIN (ORG SAFE)
====================================================== */
export const deleteAdmin = async (req, res) => {
  try {
    let orgId = req.user.organization;

    if (!orgId) {
      const headAdmin = await OrgHeadAdmin.findById(req.user.id);
      if (!headAdmin) {
        return res.status(401).json({ message: 'Invalid head admin' });
      }
      orgId = headAdmin.org_id;
    }

    const admin = await OrgAdmin.findOneAndDelete({
      _id: req.params.adminId,
      org_id: orgId,
    });

    if (!admin) {
      return res.status(404).json({
        message: 'Admin not found for this organization',
      });
    }

    return res.status(200).json({
      message: 'Admin deleted successfully',
    });
  } catch (error) {
    console.error('❌ Delete admin error:', error);
    return res.status(500).json({
      message: 'Failed to delete admin',
    });
  }
};
