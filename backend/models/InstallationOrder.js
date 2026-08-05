import mongoose from 'mongoose';

const InstallationOrderSchema = new mongoose.Schema(
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
       CUSTOMER & ORDER IDENTIFIERS
    ========================= */
    user_id: {
      type: String,
      required: true,
      index: true,
    },

    order_id: {
      type: String,
      required: true,
      index: true, // ✅ no global unique
    },

    plan_id: {
      type: String,
      index: true,
    },

    device_id: {
      type: String,
      default: '',
    },

    txn_id: {
      type: String,
      default: '',
      index: true,
    },

    amount: {
  type: Number,
  required: true,
  min: 0,
},

order_type: {
  type: String,
  enum: ['LIFETIME', 'RENTAL'],
  required: true,
  default: 'LIFETIME',
  index: true,
},

    /* =========================
       DELIVERY / INSTALLATION ADDRESS
    ========================= */
    delivery_address: {
      house_flat_no: { type: String, default: '' },
      street: { type: String, default: '' },
      area: { type: String, default: '' },
      district: { type: String, default: '' },
      state: { type: String, default: '' },
      postal_code: { type: String, default: '' },
      country: { type: String, default: '' },
    },

    /* =========================
       KYC SNAPSHOT
    ========================= */
    kyc_details: {
      type: {
        type: String,
        default: '',
      },
      document: {
        type: String,
        default: '',
      },
    },

    kyc_approval_status: {
      type: String,
      enum: ['PENDING', 'APPROVED', 'REJECTED'],
      default: 'PENDING',
      index: true,
    },

    /* =========================
       ORDER STATUS (LIFECYCLE)
    ========================= */
    status: {
      type: String,
      enum: ['OPEN', 'PENDING', 'CLOSED', 'EXPIRED', 'CANCELLED'],
      default: 'OPEN',
      trim: true,
      index: true,
    },

    /* =========================
       WORKFLOW STAGES
    ========================= */
    stages: {
      payment_received: {
        type: Boolean,
        default: false,
        index: true,
      },

      kyc_verified: {
        type: Boolean,
        default: false,
        index: true,
      },

      technician_assigned: {
        type: Boolean,
        default: false,
      },

      installation_completed: {
        type: Boolean,
        default: false,
      },
    },

    /* =========================
       TECHNICIAN ASSIGNMENT
    ========================= */
    assigned_to: {
      type: String,
      default: null,
      index: true,
    },

    technician_approval_status: {
      type: String,
      enum: ['PENDING', 'ACCEPTED', 'REJECTED'],
      default: null,
      index: true,
    },

    completed_at: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

/* =========================
   INDEXES
========================= */

// 🔥 IMPORTANT: UNIQUE PER ORG (FIX)
InstallationOrderSchema.index(
  { org_id: 1, order_id: 1 },
  { unique: true }
);

// Useful indexes
InstallationOrderSchema.index({ org_id: 1, user_id: 1 });
InstallationOrderSchema.index({ org_id: 1, status: 1 });
InstallationOrderSchema.index({ org_id: 1, 'stages.payment_received': 1 });
InstallationOrderSchema.index({ org_id: 1, kyc_approval_status: 1 });
InstallationOrderSchema.index({ org_id: 1, assigned_to: 1 });
InstallationOrderSchema.index({ org_id: 1, order_type: 1 });

/* =========================
   VIRTUALS
========================= */

InstallationOrderSchema.virtual('payment_received_ui').get(function () {
  return this.stages?.payment_received === true;
});

InstallationOrderSchema.set('toJSON', { virtuals: true });
InstallationOrderSchema.set('toObject', { virtuals: true });

export default mongoose.model(
  'installation_orders',
  InstallationOrderSchema
);