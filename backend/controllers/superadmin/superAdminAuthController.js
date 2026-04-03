import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import SuperAdmin from '../../models/SuperAdmin.js';
import sendEmail from '../../utils/sendEmail.js';

/* =====================================================
   REGISTER SUPER ADMIN
===================================================== */
export const superAdminRegister = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({
        message: 'All fields are required',
      });
    }

    const existingAdmin = await SuperAdmin.findOne({
      email: email.toLowerCase(),
    });

    if (existingAdmin) {
      return res.status(400).json({
        message: 'SuperAdmin already exists',
      });
    }

    // ✅ MODEL HANDLES HASHING
    const admin = await SuperAdmin.create({
      username,
      email: email.toLowerCase(),
      password,
    });

    return res.status(201).json({
      success: true,
      message: 'SuperAdmin registered successfully',
      user: {
        id: admin._id,
        username: admin.username,
        email: admin.email,
      },
    });
  } catch (error) {
    console.error('❌ SUPERADMIN REGISTER ERROR:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

/* =====================================================
   LOGIN SUPER ADMIN
===================================================== */
export const superAdminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: 'Email and password are required',
      });
    }

    const admin = await SuperAdmin.findOne({
      email: email.toLowerCase(),
    }).select('+password');

    if (!admin) {
      return res.status(401).json({
        message: 'Invalid email or password',
      });
    }

    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        message: 'Invalid email or password',
      });
    }

    const token = jwt.sign(
      { id: admin._id, role: 'superadmin' },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(200).json({
      success: true,
      token,
      role: 'superadmin',
      user: {
        id: admin._id,
        username: admin.username,
        email: admin.email,
      },
    });
  } catch (error) {
    console.error('❌ SUPERADMIN LOGIN ERROR:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

/* =====================================================
   CHANGE PASSWORD (LOGGED IN)
===================================================== */
export const changeSuperAdminPassword = async (req, res) => {
  try {
    const adminId = req.user.id;
    const { password } = req.body;

    if (!password || password.length < 6) {
      return res.status(400).json({
        message: 'Password must be at least 6 characters',
      });
    }

    const admin = await SuperAdmin.findById(adminId).select('+password');

    if (!admin) {
      return res.status(404).json({
        message: 'SuperAdmin not found',
      });
    }

    // ✅ DO NOT HASH HERE
    admin.password = password;
    await admin.save(); // model hashes

    return res.status(200).json({
      success: true,
      message: 'Password updated successfully',
    });
  } catch (error) {
    console.error('❌ CHANGE PASSWORD ERROR:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

/* =====================================================
   FORGOT PASSWORD (EMAIL + TOKEN)
===================================================== */
export const forgotSuperAdminPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        message: 'Email is required',
      });
    }

    const admin = await SuperAdmin.findOne({
      email: email.toLowerCase(),
    });

    if (!admin) {
      return res.status(404).json({
        message: 'SuperAdmin not found',
      });
    }

    // 🔥 Clear old tokens
    admin.resetPasswordToken = undefined;
    admin.resetPasswordExpire = undefined;

    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    admin.resetPasswordToken = hashedToken;
    admin.resetPasswordExpire = Date.now() + 15 * 60 * 1000;

    await admin.save({ validateBeforeSave: false });

    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

    await sendEmail({
      to: admin.email,
      subject: 'Reset your Domesticro password',
      html: `
        <p>You requested a password reset.</p>
        <p>
          <a href="${resetUrl}">Click here to reset your password</a>
        </p>
        <p>This link will expire in 15 minutes.</p>
      `,
    });

    return res.status(200).json({
      message: 'Password reset link sent to email',
    });
  } catch (error) {
    console.error('❌ FORGOT PASSWORD ERROR:', error);
    return res.status(500).json({
      message: 'Failed to send reset email',
    });
  }
};

/* =====================================================
   RESET PASSWORD (TOKEN)
===================================================== */
export const resetSuperAdminPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password || password.length < 6) {
      return res.status(400).json({
        message: 'Password must be at least 6 characters',
      });
    }

    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    const admin = await SuperAdmin.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() },
    }).select('+password');

    if (!admin) {
      return res.status(400).json({
        message: 'Invalid or expired reset token',
      });
    }

    // ✅ DO NOT HASH HERE
    admin.password = password;
    admin.resetPasswordToken = undefined;
    admin.resetPasswordExpire = undefined;

    await admin.save(); // model hashes

    return res.status(200).json({
      success: true,
      message: 'Password reset successful',
    });
  } catch (error) {
    console.error('❌ RESET PASSWORD ERROR:', error);
    return res.status(500).json({
      message: 'Server error',
    });
  }
};
