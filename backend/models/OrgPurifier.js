import mongoose from 'mongoose';

const orgPurifierSchema = new mongoose.Schema(
  {
    device_id: {
      type: String, // RO_10001
      required: true,
      uppercase: true,
    },

    user_id: {
      type: String,
      default: null,
    },

    org_id: {
      type: String,
      required: true,
      index: true,
    },

    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'inactive',
    },

    installed_at: Date,
    last_service_date: Date,

    connectivity_status: String,
    installed_location: String,

    firmware_version: {
      type: String,
      default: 'v1.0',
    },

    is_locked: {
      type: Boolean,
      default: false,
    },

    total_usage: Number,
    avg_usage: Number,

    tds_high: Number,
    tds_low: Number,

    filter_life: Number,

    installed_by: String,
    deregistered_at: Date,

    replaced_module_history: [
      {
        serial_number: {
          type: String,
          required: true,
        },
        replaced_at: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
    collection: 'org_purifiers',
  }
);

export default mongoose.model('OrgPurifier', orgPurifierSchema);
