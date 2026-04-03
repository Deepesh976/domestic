import mongoose from 'mongoose';

const OrgSupportSchema = new mongoose.Schema(
  {
    org_id: {
      type: String, // org_001 from JWT
      required: true,
      index: true,
    },

    email: {
      type: String,
      required: true,
    },

    phoneNo: {
      type: String,
      required: true,
    },

    address: {
      type: String,
      required: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'org_head_admins',
    },
  },
  { timestamps: true }
);

export default mongoose.model('org_support', OrgSupportSchema);
