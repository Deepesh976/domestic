import mongoose from 'mongoose';

const RechargedPlanSchema = new mongoose.Schema(
  {
    org_id: {
      type: String,
      required: true,
      index: true,
    },
    device_id: {
      type: String,
      required: true,
      index: true,
    },
    user_id: String,

    plan_id: {
      type: String,
      required: true,
      index: true,
    },

    txn_id: {
      type: String,
      required: true,
      unique: true,
    },

    limit: {
      type: Number,
      default: 0,
    },

    validity: String,

    status: {
      type: String,
      enum: ['active', 'consumed', 'expired', 'failed'],
      default: 'active',
    },

    ack: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    collection: 'recharged_plans',
  }
);

const RechargedPlan = mongoose.model(
  'RechargedPlan',
  RechargedPlanSchema
);

export default RechargedPlan; // ✅ THIS LINE IS REQUIRED
