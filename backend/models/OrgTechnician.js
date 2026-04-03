import mongoose from 'mongoose';

const OrgTechnicianSchema = new mongoose.Schema(
  {
    /* =========================
       ORGANIZATION SCOPING
    ========================= */
    org_id: {
      type: String,
      required: true,
      index: true,
    },

    /* =========================
       BASIC IDENTITY
    ========================= */
    user_id: {
      type: String, // uuid v4 (generated at registration)
      required: true,
      index: true,
    },

    user_name: {
      first_name: { type: String, required: true },
      last_name: { type: String, required: true },
    },

    /* =========================
       CONTACT DETAILS
    ========================= */
    phone_number: {
      type: String,
      required: true,
      index: true,
    },

    email_address: {
      type: String,
      lowercase: true,
      trim: true,
    },

    /* =========================
       ADDRESS
    ========================= */
    address: {
      flat_no: String,
      area: String,
      city: String,
      state: String,
      postal_code: String,
      country: String,
    },

    /* =========================
       TECHNICIAN STATUS (VERY IMPORTANT)
    ========================= */
    is_active: {
      type: Boolean,
      default: false, // HeadAdmin controls this
      index: true,
    },

    /* =========================
       KYC DETAILS
    ========================= */
    kyc_details: {
      doc_type: String,
      doc_image: String,
      kyc_approval_status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending',
        index: true,
      },
    },

    /* =========================
       DEVICE STATUS
    ========================= */
    user_device_status: {
      type: String,
      enum: ['linked', 'unlinked'],
      default: 'unlinked',
    },
  },
  {
    timestamps: true,
  }
);

/* =========================
   INDEXES (PERFORMANCE)
========================= */
OrgTechnicianSchema.index({
  org_id: 1,
  is_active: 1,
});

export default mongoose.model(
  'org_technicians',
  OrgTechnicianSchema
);
