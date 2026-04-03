import jwt from 'jsonwebtoken';
import crypto from 'crypto';

import OrgAdmin from '../../models/OrgAdmin.js';
import OrgHeadAdmin from '../../models/OrgHeadAdmin.js';
import Organization from '../../models/Organization.js';
import sendEmail from '../../utils/sendEmail.js';

/* =====================================================
   ADMIN + HEADADMIN LOGIN (UNIFIED)
===================================================== */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: 'Email and password are required',
      });
    }

    const normalizedEmail = email.toLowerCase();

    let user;
    let role;
    let organization;

    /* =========================
       TRY HEAD ADMIN FIRST
    ========================= */
    const headAdmin = await OrgHeadAdmin.findOne({
      email: normalizedEmail,
    })
      .select('+password')
      .populate('organization');

    if (headAdmin) {
      user = headAdmin;
      role = 'headadmin';
      organization = headAdmin.organization;

      console.log('🔍 HeadAdmin found:', {
        headAdminId: headAdmin._id,
        email: headAdmin.email,
        has_organization_ref: !!headAdmin.organization,
        org_id: headAdmin.org_id,
        organization_org_id: headAdmin.organization?.org_id,
      });
    } else {
      /* =========================
         TRY ADMIN
      ========================= */
      const admin = await OrgAdmin.findOne({
        email: normalizedEmail,
      })
        .select('+password')
        .populate('organization');

      if (admin) {
        user = admin;
        role = 'admin';

        console.log('🔍 Admin found:', {
          adminId: admin._id,
          email: admin.email,
          has_organization_ref: !!admin.organization,
          org_id: admin.org_id,
          organization_org_id: admin.organization?.org_id,
        });

        // Use the populated organization reference if available
        if (admin.organization) {
          organization = admin.organization;
        } else {
          // Fallback: try to find by org_id field
          console.log('⚠️ Admin organization reference not populated, trying lookup by org_id:', admin.org_id);
          organization = await Organization.findOne({
            org_id: admin.org_id,
          });
        }
      }
    }

    if (!user) {
      return res.status(401).json({
        message: 'Invalid email or password',
      });
    }

    if (!organization) {
      console.error(
        `❌ Organization not found for ${role}:`,
        {
          userId: user._id,
          email: user.email,
          user_org_id: user.org_id,
          role,
          headAdminOrgRef: role === 'headadmin' ? user.organization : null
        }
      );
      return res.status(400).json({
        message:
          'Your account is not linked to an organization. Contact administrator.',
      });
    }

    if (!organization.org_id) {
      console.error(
        `❌ Organization exists but org_id is missing:`,
        {
          organizationId: organization._id,
          org_id: organization.org_id,
          userId: user._id,
          role
        }
      );
      return res.status(400).json({
        message: 'Organization configuration error. Contact administrator.',
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        message: 'Invalid email or password',
      });
    }

    const token = jwt.sign(
      {
        id: user._id,
        role,
        org_id: organization.org_id,
      },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    const response = {
      token,
      role,
      organization: {
        org_id: organization.org_id,
        org_name: organization.org_name,
        logo: organization.logo || null,
      },
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    };

    console.log('✅ Login successful:', {
      userId: user._id,
      role,
      org_id: organization.org_id,
      org_name: organization.org_name,
    });

    return res.status(200).json(response);
  } catch (error) {
    console.error('❌ Unified Login Error:', error);
    return res.status(500).json({
      message: 'Login failed',
    });
  }
};

/* =====================================================
   CHANGE PASSWORD (ADMIN + HEADADMIN)
===================================================== */
export const changePassword = async (req, res) => {
  try {
    const { password } = req.body;
    const { id, role } = req.user;

    if (!password || password.length < 6) {
      return res.status(400).json({
        message: 'Password must be at least 6 characters long',
      });
    }

    let user;

    if (role === 'headadmin') {
      user = await OrgHeadAdmin.findById(id).select('+password');
    } else if (role === 'admin') {
      user = await OrgAdmin.findById(id).select('+password');
    } else {
      return res.status(403).json({
        message: 'Unauthorized role',
      });
    }

    if (!user) {
      return res.status(404).json({
        message: 'User not found',
      });
    }

    // ✅ DO NOT HASH HERE
    user.password = password;
    await user.save(); // model hashes

    return res.status(200).json({
      message: 'Password updated successfully',
    });
  } catch (error) {
    console.error('❌ Change Password Error:', error);
    return res.status(500).json({
      message: 'Failed to update password',
    });
  }
};

/* =====================================================
   FORGOT PASSWORD (ADMIN + HEADADMIN)
===================================================== */
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const normalizedEmail = email.toLowerCase();

    const user =
      (await OrgHeadAdmin.findOne({ email: normalizedEmail })) ||
      (await OrgAdmin.findOne({ email: normalizedEmail }));

    if (!user) {
      return res.status(404).json({
        message: 'User not found',
      });
    }

    // 🔥 Clear old tokens
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpire = Date.now() + 15 * 60 * 1000;

    await user.save({ validateBeforeSave: false });

    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

    await sendEmail({
      to: user.email,
      subject: 'Reset your Domesticro password',
      html: `
        <p>You requested a password reset.</p>
        <p>
          <a href="${resetUrl}">
            Click here to reset your password
          </a>
        </p>
        <p>This link will expire in 15 minutes.</p>
      `,
    });

    return res.status(200).json({
      message: 'Password reset link sent to email',
    });
  } catch (error) {
    console.error('❌ Forgot Password Error:', error);
    return res.status(500).json({
      message: 'Failed to send reset email',
    });
  }
};

/* =====================================================
   RESET PASSWORD (ADMIN + HEADADMIN)
===================================================== */
export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password || password.length < 6) {
      return res.status(400).json({
        message: 'Password must be at least 6 characters long',
      });
    }

    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    const user =
      (await OrgHeadAdmin.findOne({
        resetPasswordToken: hashedToken,
        resetPasswordExpire: { $gt: Date.now() },
      })) ||
      (await OrgAdmin.findOne({
        resetPasswordToken: hashedToken,
        resetPasswordExpire: { $gt: Date.now() },
      }));

    if (!user) {
      return res.status(400).json({
        message: 'Invalid or expired reset token',
      });
    }

    // ✅ DO NOT HASH HERE
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save(); // model hashes password

    return res.status(200).json({
      message: 'Password reset successful',
    });
  } catch (error) {
    console.error('❌ Reset Password Error:', error);
    return res.status(500).json({
      message: 'Failed to reset password',
    });
  }
};
