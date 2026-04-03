import Organization from '../../models/Organization.js';
import fs from 'fs';
import path from 'path';

/* =====================================================
   CREATE ORGANIZATION
   - Supports logo upload
===================================================== */
const createOrganization = async (req, res) => {
  try {
    const {
      org_id,
      org_name,
      type,
      gst_number,
      email_id,
      phone_number,
      state,
      pincode,
      country,
    } = req.body;

    /* =========================
       REQUIRED VALIDATION
    ========================= */
    if (!org_id || !org_name || !email_id) {
      return res.status(400).json({
        message: 'org_id, org_name and email_id are required',
      });
    }

    /* =========================
       DUPLICATE CHECK
    ========================= */
    const existingOrg = await Organization.findOne({
      $or: [{ org_id }, { email_id }],
    });

    if (existingOrg) {
      return res.status(409).json({
        message: 'Organization already exists',
      });
    }

    /* =========================
       CREATE
    ========================= */
    const organization = await Organization.create({
      org_id,
      org_name,
      type,
      gst_number,
      email_id,
      phone_number,
      state,
      pincode,
      country: country || 'India',

      // ✅ LOGO (filename only)
      logo: req.file ? req.file.filename : null,
    });

    return res.status(201).json(organization);
  } catch (error) {
    console.error('Create organization error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

/* =====================================================
   GET ALL ORGANIZATIONS
===================================================== */
const getOrganizations = async (req, res) => {
  try {
    const organizations = await Organization.find().sort({
      createdAt: -1,
    });

    return res.status(200).json(organizations);
  } catch (error) {
    console.error('Get organizations error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

/* =====================================================
   GET ORGANIZATION BY ID
===================================================== */
const getOrganizationById = async (req, res) => {
  try {
    const org = await Organization.findById(req.params.id);

    if (!org) {
      return res.status(404).json({
        message: 'Organization not found',
      });
    }

    return res.status(200).json(org);
  } catch (error) {
    console.error('Get organization error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

/* =====================================================
   UPDATE ORGANIZATION
   - Supports logo replacement
===================================================== */
const updateOrganization = async (req, res) => {
  try {
    const org = await Organization.findById(req.params.id);

    if (!org) {
      return res.status(404).json({
        message: 'Organization not found',
      });
    }

    /* =========================
       DELETE OLD LOGO (IF NEW UPLOADED)
    ========================= */
    if (req.file && org.logo) {
      const oldPath = path.join(
        process.cwd(),
        'uploads/organizations',
        org.logo
      );

      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
    }

    /* =========================
       UPDATE FIELDS
    ========================= */
    Object.assign(org, req.body);

    if (req.file) {
      org.logo = req.file.filename;
    }

    await org.save();

    return res.status(200).json(org);
  } catch (error) {
    console.error('Update organization error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

/* =====================================================
   DELETE ORGANIZATION
   - Also deletes logo file
===================================================== */
const deleteOrganization = async (req, res) => {
  try {
    const org = await Organization.findById(req.params.id);

    if (!org) {
      return res.status(404).json({
        message: 'Organization not found',
      });
    }

    /* =========================
       DELETE LOGO FILE
    ========================= */
    if (org.logo) {
      const filePath = path.join(
        process.cwd(),
        'uploads/organizations',
        org.logo
      );

      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await org.deleteOne();

    return res.status(200).json({
      message: 'Organization deleted',
    });
  } catch (error) {
    console.error('Delete organization error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

/* =====================================================
   EXPORTS
===================================================== */
export {
  createOrganization,
  getOrganizations,
  getOrganizationById,
  updateOrganization,
  deleteOrganization,
};
