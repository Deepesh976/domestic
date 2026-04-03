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
      unique: true,
      index: true,
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
       Only backend changes this
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

    // Stores technician UUID (user_id)
    assigned_to: {
      type: String,
      default: null,
      index: true,
    },

    // Technician response
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

InstallationOrderSchema.index({ org_id: 1, user_id: 1 });
InstallationOrderSchema.index({ org_id: 1, status: 1 });
InstallationOrderSchema.index({ org_id: 1, 'stages.payment_received': 1 });
InstallationOrderSchema.index({ org_id: 1, kyc_approval_status: 1 });
InstallationOrderSchema.index({ org_id: 1, assigned_to: 1 });

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