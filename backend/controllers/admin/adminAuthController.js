import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import OrgAdmin from '../../models/OrgAdmin.js';

export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email & password required' });
    }

    const admin = await OrgAdmin.findOne({ email }).select('+password').populate('organization');

    if (!admin) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    /* =========================
       ORG VALIDATION
    ========================= */
    if (!admin.organization) {
      console.error(
        '❌ Admin organization reference missing:',
        { adminId: admin._id, email: admin.email }
      );
      return res.status(400).json({
        message:
          'Admin is not linked to an organization. Contact administrator.',
      });
    }

    /* =========================
       RESOLVE ORG_ID (FALLBACK)
    ========================= */
    let orgId = admin.organization.org_id || admin.org_id;

    if (!orgId) {
      console.error(
        '❌ Organization missing org_id:',
        { adminId: admin._id, organizationId: admin.organization._id }
      );
      return res.status(400).json({
        message: 'Organization is not properly configured.',
      });
    }

    const token = jwt.sign(
      {
        id: admin._id,
        role: 'admin',
        org_id: orgId,
      },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    return res.status(200).json({
      token,
      role: 'admin',
      organization: {
        org_id: orgId,
        org_name: admin.organization.org_name,
        logo: admin.organization.logo,
      },
      user: {
        id: admin._id,
        username: admin.username,
        email: admin.email,
      },
    });
  } catch (err) {
    console.error('❌ Admin Login Error:', err);
    res.status(500).json({ message: 'Login failed' });
  }
};
