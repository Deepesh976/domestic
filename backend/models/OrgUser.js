import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const orgUserSchema = new mongoose.Schema(
  {
    /* =========================
       UNIQUE USER ID (AUTO UUID)
    ========================= */
    user_id: {
      type: String,
      default: uuidv4, // 🔥 auto generate
      unique: true,
      index: true,
    },

    /* =========================
       ORGANIZATION
    ========================= */
    org_id: {
      type: String,
      index: true,
      required: true,
    },

    /* =========================
       BASIC INFO
    ========================= */
    email_address: {
      type: String,
      lowercase: true,
      trim: true,
      required: true,
    },

    phone_number: {
      type: String,
      trim: true,
      required: true,
    },

    user_name: {
      first_name: {
        type: String,
        required: true,
      },
      last_name: {
        type: String,
        default: '',
      },
    },

    /* =========================
       ADDRESS
    ========================= */
address: {
  line: { type: String, default: '' },
  street: { type: String, default: '' },
  area: { type: String, default: '' },
  city: { type: String, default: '' },
  state: { type: String, default: '' },
  code: { type: String, default: '' },
  country: { type: String, default: 'India' },
},

    /* =========================
       STATUS
    ========================= */
    is_active: {
      type: Boolean,
      default: true, // 🔥 better UX
    },

    /* =========================
       KYC DETAILS
    ========================= */
    kyc_details: {
      doc_type: {
        type: String,
        default: '',
      },
      doc_image: {
        type: String,
        default: null,
      },
      kyc_approval_status: {
        type: String,
        enum: ['approved', 'rejected', 'pending'],
        default: 'pending',
      },
    },

    /* =========================
       DEVICE STATUS
    ========================= */
    user_device_status: {
      type: String,
      enum: ['linked', 'unlinked', 'declined'],
      default: 'unlinked',
    },
  },
  {
    timestamps: true,        // ✅ REQUIRED for sorting
    collection: 'org_users',
  }
);

/* =========================
   🔥 INDEX FOR PERFORMANCE
========================= */
orgUserSchema.index({ org_id: 1, createdAt: -1 });

/* =========================
   🔥 VIRTUAL FULL NAME
========================= */
orgUserSchema.virtual('full_name').get(function () {
  return `${this.user_name.first_name} ${this.user_name.last_name}`;
});

/* =========================
   🔥 CLEAN API RESPONSE
   (Frontend friendly)
========================= */
orgUserSchema.set('toJSON', {
  virtuals: true,
  transform: function (doc, ret) {
    return {
      id: ret._id,
      user_id: ret.user_id,

      name: `${ret.user_name?.first_name || ''} ${ret.user_name?.last_name || ''}`,
      email: ret.email_address,
      phone: ret.phone_number,

      address: `${ret.address?.area || ''}, ${ret.address?.city || ''}, ${ret.address?.state || ''}, ${ret.address?.country || ''}`,

      kyc_status: ret.kyc_details?.kyc_approval_status,
      device_status: ret.user_device_status,

      createdAt: ret.createdAt,
    };
  },
});

export default mongoose.model('OrgUser', orgUserSchema);