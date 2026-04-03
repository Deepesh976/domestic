import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

/* =====================================================
   SERVICE REQUEST SCHEMA
===================================================== */
const ServiceRequestSchema = new mongoose.Schema(
  {
    /* =========================
       IDENTIFIERS
    ========================= */
    request_id: {
      type: String,
      default: uuidv4, // ✅ UUID v4 auto-generated
      unique: true,
      index: true,
    },

    user_id: {
      type: String, // OrgUser.user_id
      index: true,
    },

    org_id: {
      type: String,
      required: true,
      index: true,
    },

    /* =========================
       REQUEST DETAILS
    ========================= */
    service_type: String,
    device_id: String,
    service_description: String,

    /* =========================
       TECHNICIAN ASSIGNMENT
    ========================= */
    assigned_to: {
      type: String, //OrgTechnician user_id (UUID)
      default: null,
      index: true,
    },
    technician_approval_status: {
  type: String,
  enum: ['PENDING', 'ACCEPTED', 'REJECTED'],
  default: null,
  index: true,
},

    /* =========================
       FIXED BY (IMMUTABLE HISTORY)
       - Stored at CLOSE time
       - Never changes
    ========================= */
    fixed_by: {
      technician_id: {
        type: String,
        default: null,
      },
      technician_name: {
        type: String,
        default: null,
      },
    },

    /* =========================
       TIMELINE
    ========================= */
    scheduled_at: {
      type: Date,
      default: null,
    },

    arrived_at: {
      type: Date,
      default: null,
    },

    completed_at: {
      type: Date,
      default: null,
    },

    /* =========================
       STATUS
    ========================= */
    status: {
      type: String,
      enum: ['OPEN', 'CLOSED'],
      default: 'OPEN',
      index: true,
    },

    /* =========================
       SERVICE OUTPUT
    ========================= */
    replaced_parts: {
      type: [String],
      default: [],
    },

    completion_images: {
      type: [String],
      default: [],
    },

    observations: {
      severity: { type: String },
      notes: { type: String },
    },

    /* =========================
       LOCATION
    ========================= */
    location: {
      street: String,
      area: String,
      city: String,
      state: String,
      postal_code: String,
      country: String,
    },
  },
  {
    timestamps: true, // createdAt, updatedAt
  }
);

/* =========================
   INDEXES
========================= */
ServiceRequestSchema.index({ org_id: 1, status: 1 });
ServiceRequestSchema.index({ org_id: 1, device_id: 1 });
ServiceRequestSchema.index({ 'fixed_by.technician_id': 1 });

export default mongoose.model(
  'service_requests',
  ServiceRequestSchema
);
