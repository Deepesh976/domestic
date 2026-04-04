import Device from '../../models/Device.js';

/* =========================
   CREATE DEVICE
========================= */
const createDevice = async (req, res) => {
  try {
    const { org_id, mac_id, serial_number } = req.body;

    if (!org_id || !mac_id || !serial_number) {
      return res.status(400).json({
        message: 'Org ID, MAC ID and Serial Number are required',
      });
    }

    const normalized_mac_id = mac_id.trim().toUpperCase();
    const normalized_serial = serial_number.trim().toUpperCase();

    const exists = await Device.findOne({
      $or: [
        { mac_id: normalized_mac_id },
        { serial_number: normalized_serial },
      ],
    });

    if (exists) {
      return res.status(409).json({
        message: 'Device with same MAC ID or Serial Number already exists',
      });
    }

const device = await Device.create({
  org_id,
  mac_id: normalized_mac_id,
  serial_number: normalized_serial,
});

    return res.status(201).json({
      message: 'Device created successfully',
      device,
    });
  } catch (error) {
    console.error('❌ Create device error:', error);
    return res.status(500).json({
      message: 'Failed to create device',
    });
  }
};

/* =========================
   GET ALL DEVICES
========================= */
const getDevices = async (req, res) => {
  try {
    const devices = await Device.find().sort({ createdAt: -1 });

    const formatted = devices.map((d) => ({
      _id: d._id,
      org_id: d.org_id,
      mac_id: d.mac_id,
      serial_number: d.serial_number,
      created_at: d.createdAt, // ✅ consistent naming
    }));

    return res.status(200).json(formatted);
  } catch (error) {
    console.error('❌ Get devices error:', error);
    return res.status(500).json({
      message: 'Failed to fetch devices',
    });
  }
};

const deleteDevice = async (req, res) => {
  try {
    const { id } = req.params;

    const device = await Device.findById(id);

    if (!device) {
      return res.status(404).json({ message: 'Device not found' });
    }

    await Device.findByIdAndDelete(id);

    return res.status(200).json({
      message: 'Device deleted successfully',
    });
  } catch (error) {
    console.error('❌ Delete device error:', error);
    return res.status(500).json({
      message: 'Failed to delete device',
    });
  }
};

export { createDevice, getDevices, deleteDevice };
