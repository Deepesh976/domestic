import mongoose from 'mongoose';

const dailyPurifierLogSchema = new mongoose.Schema(
  {
    timestamp: {
      type: Date,
      required: true,
    },

    metadata: {
      device_id: {
        type: String,
        required: true,
        index: true,
      },
      org_id: {
        type: String,
        required: true,
        index: true,
      },
    },

    tds_in: Number,
    tds_out: Number,
    lps_error: Boolean,
    flow_sensor_error: Boolean,
    plan_limit: Number,
    filter_life: Number,
    total_litres: Number,
    rem_litres: Number,
    uv_error: Boolean,
  },
  {
    collection: 'daily_purifier_log',
  }
);

export default mongoose.model('DailyPurifierLog', dailyPurifierLogSchema);
