import bcrypt from 'bcryptjs';
import OrgAdmin from '../../models/OrgAdmin.js';
import OrgHeadAdmin from '../../models/OrgHeadAdmin.js';
import Organization from '../../models/Organization.js';

/* =====================================================
   CREATE ADMIN / HEAD ADMIN (WITH KYC)
===================================================== */
export const createAdmin = async (req, res) => {
  try {
    const {
      organization,
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
      role, // admin | headadmin
      doc_type,
      doc_detail,
    } = req.body;

    /* -------------------------
       BASIC VALIDATION
    ------------------------- */
    if (!organization || !username || !email || !password || !role) {
      return res.status(400).json({
        message: 'Required fields missing',
      });
    }

    /* -------------------------
       FETCH ORGANIZATION
    ------------------------- */
    const org = await Organization.findById(organization);
    if (!org) {
      return res.status(404).json({
        message: 'Organization not found',
      });
    }

    /* -------------------------
       SELECT MODEL
    ------------------------- */
    const Model = role === 'headadmin' ? OrgHeadAdmin : OrgAdmin;

    /* -------------------------
       DUPLICATE EMAIL CHECK
    ------------------------- */
    const exists = await Model.findOne({ email });
    if (exists) {
      return res.status(409).json({
        message: 'Admin already exists with this email',
      });
    }

    /* -------------------------
       CREATE DOCUMENT
    ------------------------- */
    const admin = await Model.create({
      organization: org._id,
      org_id: org.org_id,
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
      role,
      kyc_details: {
        doc_type,
        doc_detail,
        kyc_approval_status: 'pending',
        kyc_image: req.file ? req.file.filename : null, // ✅ filename only
      },
    });

    return res.status(201).json({
      message: 'Admin created successfully',
      admin,
    });
  } catch (error) {
    console.error('❌ Create admin error:', error);
    return res.status(500).json({
      message: 'Server error',
    });
  }
};

/* =====================================================
   GET ALL ADMINS + HEAD ADMINS
===================================================== */
export const getAdmins = async (req, res) => {
  try {
    const admins = await OrgAdmin.find()
      .populate('organization', 'org_id org_name')
      .sort({ createdAt: -1 });

    const headadmins = await OrgHeadAdmin.find()
      .populate('organization', 'org_id org_name')
      .sort({ createdAt: -1 });

    return res.status(200).json([
      ...headadmins,
      ...admins,
    ]);
  } catch (error) {
    console.error('❌ Get admins error:', error);
    return res.status(500).json({
      message: 'Server error',
    });
  }
};

/* =====================================================
   GET ADMIN BY ID
===================================================== */
export const getAdminById = async (req, res) => {
  try {
    let admin = await OrgAdmin.findById(req.params.id)
      .populate('organization', 'org_id org_name');

    if (!admin) {
      admin = await OrgHeadAdmin.findById(req.params.id)
        .populate('organization', 'org_id org_name');
    }

    if (!admin) {
      return res.status(404).json({
        message: 'Admin not found',
      });
    }

    return res.status(200).json(admin);
  } catch (error) {
    console.error('❌ Get admin error:', error);
    return res.status(500).json({
      message: 'Server error',
    });
  }
};

/* =====================================================
   UPDATE ADMIN / HEAD ADMIN
===================================================== */
export const updateAdmin = async (req, res) => {
  try {
    const {
      role,
      password,
      organization,
      doc_type,
      doc_detail,
      kyc_approval_status,
      ...rest
    } = req.body;

    const Model = role === 'headadmin' ? OrgHeadAdmin : OrgAdmin;

    /* -------------------------
       HANDLE ORGANIZATION CHANGE
    ------------------------- */
    if (organization) {
      const org = await Organization.findById(organization);
      if (!org) {
        return res.status(404).json({
          message: 'Organization not found',
        });
      }

      rest.organization = org._id;
      rest.org_id = org.org_id;
    }

    /* -------------------------
       PASSWORD UPDATE
    ------------------------- */
    if (password) {
      rest.password = await bcrypt.hash(password, 10);
    }

    /* -------------------------
       KYC UPDATE
    ------------------------- */
    if (
      doc_type ||
      doc_detail ||
      kyc_approval_status ||
      req.file
    ) {
      rest.kyc_details = {
        doc_type,
        doc_detail,
        kyc_approval_status,
      };

      if (req.file) {
        rest.kyc_details.kyc_image = req.file.filename;
      }
    }

    const admin = await Model.findByIdAndUpdate(
      req.params.id,
      rest,
      { new: true }
    ).populate('organization', 'org_id org_name');

    if (!admin) {
      return res.status(404).json({
        message: 'Admin not found',
      });
    }

    return res.status(200).json({
      message: 'Admin updated successfully',
      admin,
    });
  } catch (error) {
    console.error('❌ Update admin error:', error);
    return res.status(500).json({
      message: 'Server error',
    });
  }
};

/* =====================================================
   DELETE ADMIN / HEAD ADMIN
===================================================== */
export const deleteAdmin = async (req, res) => {
  try {
    const admin =
      (await OrgAdmin.findByIdAndDelete(req.params.id)) ||
      (await OrgHeadAdmin.findByIdAndDelete(req.params.id));

    if (!admin) {
      return res.status(404).json({
        message: 'Admin not found',
      });
    }

    return res.status(200).json({
      message: 'Admin deleted successfully',
    });
  } catch (error) {
    console.error('❌ Delete admin error:', error);
    return res.status(500).json({
      message: 'Server error',
    });
  }
};
