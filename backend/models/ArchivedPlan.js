import mongoose from 'mongoose';

const ArchivedPlanSchema = new mongoose.Schema(
  {
    plan_id: {
      type: String,
      required: true,
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

    action: {
      type: String,
      enum: ['edited', 'deleted'],
      required: true,
    },

    modified_at: {
      type: Date,
      default: Date.now,
    },

    modified_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
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
  'ArchivedPlan',
  ArchivedPlanSchema,
  'archived_plans' // ✅ EXISTING COLLECTION
);
