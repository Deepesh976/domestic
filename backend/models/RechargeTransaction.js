import mongoose from 'mongoose';

const RechargeTransactionSchema = new mongoose.Schema(
  {
    /* =========================
       USER & ORG
    ========================= */
    user_id: {
      type: String,
      ref: 'OrgUser',
      required: true,
    },

    org_id: {
      type: String,
      required: true,
      index: true,
    },

    device_id: {
      type: String,
      default: null, // ✅ FIXED (optional)
    },

    /* =========================
       TRANSACTION IDS
    ========================= */
    txn_id: {
      type: String,
      required: true,
      unique: true,
    },

    order_id: {
      type: String,
      unique: true,
      sparse: true, // ✅ FIXED (allow null)
    },

    plan_id: {
      type: String,
      default: null,
    },

    /* =========================
       PAYMENT DETAILS
    ========================= */
    amount: {
      type: Number,
      required: true,
      min: 1, // ✅ FIXED
    },

    payment_mode: {
      type: String,
      enum: ['UPI', 'Offline'],
      required: true,
    },

    payment_status: {
      type: String,
      enum: ['Success', 'Pending', 'Cancelled', 'Expired'],
      default: 'Pending',
    },

    payment_purpose: {
      type: String,
      enum: ['Order', 'Recharge'],
      default: 'Recharge',
    },
  },
  {
    timestamps: true, // ✅ using createdAt
    collection: 'recharge_transactions',
  }
);

/* =========================
   INDEX FOR PERFORMANCE
========================= */
RechargeTransactionSchema.index({ org_id: 1, createdAt: -1 });

export default mongoose.model(
  'RechargeTransaction',
  RechargeTransactionSchema
);