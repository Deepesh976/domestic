import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

/* =========================
   KYC SUB-SCHEMA
========================= */
const kycSchema = new mongoose.Schema(
  {
    doc_type: String,
    doc_detail: String,
    kyc_approval_status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    kyc_image: String, // filename only
  },
  { _id: false }
);

/* =========================
   ORG ADMIN SCHEMA
========================= */
const orgAdminSchema = new mongoose.Schema(
  {
    /* =========================
       ORGANIZATION
    ========================= */
    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },

    org_id: {
      type: String,
      required: true,
      index: true,
    },

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
      lowercase: true,
      trim: true,
      index: true,
    },

    phone_number: String,

    /* =========================
       ADDRESS
    ========================= */
    flat_no: String,
    area: String,
    city: String,
    state: String,
    country: String,
    postal_code: String,

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

    /* =========================
       KYC
    ========================= */
    kyc_details: kycSchema,

    /* =========================
       ROLE
    ========================= */
    role: {
      type: String,
      enum: ['admin'],
      default: 'admin',
    },
  },
  {
    timestamps: true,
    collection: 'org_admins',
  }
);

/* =========================
   INDEXES
========================= */
orgAdminSchema.index({ email: 1 }, { unique: true });

/* =========================
   HASH PASSWORD BEFORE SAVE
========================= */
orgAdminSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  this.password = await bcrypt.hash(this.password, 10);
  next();
});

/* =========================
   PASSWORD COMPARE METHOD
========================= */
orgAdminSchema.methods.comparePassword = function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model('OrgAdmin', orgAdminSchema);
