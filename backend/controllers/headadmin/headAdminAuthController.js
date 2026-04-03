import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import OrgHeadAdmin from '../../models/OrgHeadAdmin.js';

/* =====================================================
   HEAD ADMIN LOGIN
===================================================== */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    /* =========================
       BASIC VALIDATION
    ========================= */
    if (!email || !password) {
      return res.status(400).json({
        message: 'Email and password are required',
      });
    }

    /* =========================
       FIND HEAD ADMIN
    ========================= */
    const headAdmin = await OrgHeadAdmin.findOne({
      email: email.toLowerCase(),
    }).populate('organization');

    if (!headAdmin) {
      return res.status(401).json({
        message: 'Invalid email or password',
      });
    }

    /* =========================
       PASSWORD CHECK
    ========================= */
    const isMatch = await bcrypt.compare(password, headAdmin.password);

    if (!isMatch) {
      return res.status(401).json({
        message: 'Invalid email or password',
      });
    }

    /* =========================
       ORG VALIDATION
    ========================= */
    if (!headAdmin.organization) {
      console.error(
        '❌ HeadAdmin organization reference missing:',
        { headAdminId: headAdmin._id, email: headAdmin.email }
      );
      return res.status(400).json({
        message:
          'HeadAdmin is not linked to an organization. Contact administrator.',
      });
    }

    /* =========================
       RESOLVE ORG_ID (FALLBACK)
    ========================= */
    let orgId = headAdmin.organization.org_id || headAdmin.org_id;

    if (!orgId) {
      console.error(
        '❌ Organization missing org_id:',
        { headAdminId: headAdmin._id, organizationId: headAdmin.organization._id }
      );
      return res.status(400).json({
        message: 'Organization is not properly configured.',
      });
    }

    /* =========================
       SIGN JWT
    ========================= */
    const token = jwt.sign(
      {
        id: headAdmin._id,
        role: 'headadmin',
        org_id: orgId,
      },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    return res.status(200).json({
      token,
      role: 'headadmin',
      organization: {
        org_id: orgId,
        org_name: headAdmin.organization.org_name,
        logo: headAdmin.organization.logo,
      },
      user: {
        id: headAdmin._id,
        username: headAdmin.username,
        email: headAdmin.email,
      },
    });
  } catch (error) {
    console.error('❌ HeadAdmin Login Error:', error);
    return res.status(500).json({
      message: 'Login failed',
    });
  }
};

/* =====================================================
   CHANGE PASSWORD – HEAD ADMIN
===================================================== */
export const changePassword = async (req, res) => {
  try {
    const { password } = req.body;
    const headAdminId = req.user.id;

    /* =========================
       VALIDATION
    ========================= */
    if (!password) {
      return res.status(400).json({
        message: 'Password is required',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: 'Password must be at least 6 characters long',
      });
    }

    /* =========================
       FIND HEAD ADMIN
    ========================= */
    const headAdmin = await OrgHeadAdmin.findById(headAdminId).select('+password');

    if (!headAdmin) {
      return res.status(404).json({
        message: 'Head admin not found',
      });
    }

    /* =========================
       HASH & SAVE PASSWORD
    ========================= */
    const hashedPassword = await bcrypt.hash(password, 10);
    headAdmin.password = hashedPassword;
    await headAdmin.save();

    return res.status(200).json({
      message: 'Password updated successfully',
    });
  } catch (error) {
    console.error('❌ HeadAdmin Change Password Error:', error);
    return res.status(500).json({
      message: 'Failed to update password',
    });
  }
};
