import mongoose from 'mongoose';

const organizationSchema = new mongoose.Schema(
  {
    /* =========================
       IDENTIFIERS
    ========================= */
    org_id: {
      type: String,
      unique: true,
      index: true, // e.g. "org_001"
      required: true,
      trim: true,
    },

    org_name: {
      type: String,
      required: true,
      trim: true,
    },

    /* =========================
       ORGANIZATION DETAILS
    ========================= */
    type: {
      type: String,
      trim: true,
    },

    gst_number: {
      type: String,
      trim: true,
    },

    email_id: {
      type: String,
      lowercase: true,
      trim: true,
      required: true,
      index: true,
    },

    phone_number: {
      type: String,
      trim: true,
    },

    state: {
      type: String,
      trim: true,
    },

    pincode: {
      type: String,
      trim: true,
    },

    country: {
      type: String,
      default: 'India',
      trim: true,
    },

    /* =========================
       ORGANIZATION LOGO
       (Stored in /uploads/organizations)
    ========================= */
    logo: {
      type: String, // filename only
      default: null,
    },
  },
  {
    timestamps: true,
    collection: 'organizations', // ✅ EXACT Mongo collection
  }
);

const Organization = mongoose.model(
  'Organization',
  organizationSchema
);

export default Organization;
