import mongoose from 'mongoose';

const deviceSchema = new mongoose.Schema(
  {
    org_id: {
      type: String,
      required: true,
      index: true,
    },

    mac_id: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },

    serial_number: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },
  },
  {
    timestamps: true,
    collection: 'devices',
  }
);

// ✅ AUTO GENERATE QR BEFORE SAVE
deviceSchema.pre('save', function (next) {
  if (!this.qr_code) {
    const qrPayload = {
      org_id: this.org_id,
      mac_id: this.mac_id,
      serial_number: this.serial_number,
    };

    this.qr_code = JSON.stringify(qrPayload);
  }

  next();
});

const Device = mongoose.model('Device', deviceSchema);
export default Device;