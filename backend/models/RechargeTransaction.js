import mongoose from 'mongoose';

const RechargeTransactionSchema = new mongoose.Schema(
  {
    user_id: { type: String, required: true },
    org_id: { type: String, required: true },
    device_id: { type: String, required: true },

    txn_id: { type: String, required: true },
    plan_id: { type: String },

    // ✅ MATCHES DB
    amount: { type: Number, required: true },
    payment_mode: { type: String },
    payment_status: { type: String }, // SUCCESS / FAILED

    // ✅ FIXED (match DB)
    created_at: { type: Date, default: Date.now },
  },
  {
    collection: 'recharge_transactions',
  }
);

export default mongoose.model(
  'RechargeTransaction',
  RechargeTransactionSchema
);