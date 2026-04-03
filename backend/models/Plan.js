import mongoose from 'mongoose';

const PlanSchema = new mongoose.Schema(
  {
    plan_id: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    org_id: {
      type: String,
      required: true,
      index: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    limit: {
      type: Number,
      required: true,
      min: 0,
    },

    validity: {
      type: String,
      default: null,
    },

    type: {
      type: String,
      enum: ['Standard', 'Premium'],
      default: 'Standard',
    },

    created_at: {
      type: Date,
      default: Date.now,
    },

    created_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

/**
 * 🔥 IMPORTANT:
 * Third argument forces MongoDB collection name
 */
export default mongoose.model(
  'Plan',
  PlanSchema,
  'active_plans' // ✅ EXISTING COLLECTION
);
