import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const superAdminSchema = new mongoose.Schema(
  {
    /* =========================
       BASIC INFO
    ========================= */
    username: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    /* =========================
       AUTH
    ========================= */
    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false, // 🔐 never return password by default
    },

    /* =========================
       FORGOT PASSWORD
    ========================= */
    resetPasswordToken: {
      type: String,
      select: false,
    },

    resetPasswordExpire: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

/* =========================
   HASH PASSWORD BEFORE SAVE
========================= */
superAdminSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  this.password = await bcrypt.hash(this.password, 10);
  next();
});

/* =========================
   PASSWORD COMPARE METHOD
========================= */
superAdminSchema.methods.comparePassword = function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

const SuperAdmin = mongoose.model('super_admin', superAdminSchema);

export default SuperAdmin;
