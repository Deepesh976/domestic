import mongoose from 'mongoose';

const orgUserSchema = new mongoose.Schema(
  {
    user_id: {
      type: String,
      index: true,
    },

    org_id: {
      type: String,
      index: true,
    },

    email_address: {
      type: String,
      lowercase: true,
      trim: true,
    },

    phone_number: {
      type: String,
      trim: true,
    },

    user_name: {
      first_name: String,
      last_name: String,
    },

    address: {
      flat_no: { type: String, default: '' },
      area: String,
      city: String,
      state: String,
      postal_code: Number,
      country: String,
    },

    is_active: {
      type: Boolean,
      default: false,
    },
kyc_details: {
  doc_type: {
    type: String,
    default: '',
  },
  doc_image: {
    type: String, // filename only
    default: null,
  },
  kyc_approval_status: {
    type: String,
    enum: ['approved', 'rejected', 'pending'],
    default: 'pending',
  },
},


    user_device_status: {
      type: String,
      enum: ['linked', 'unlinked', 'declined'],
      default: 'unlinked',
    },
  },
  {
    timestamps: true,          // ✅ ONE place only
    collection: 'org_users',   // ✅ correct
  }
);

export default mongoose.model('OrgUser', orgUserSchema);
