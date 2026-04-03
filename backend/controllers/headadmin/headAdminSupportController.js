import Support from '../../models/Support.js';

/* =========================
   GET SUPPORT (Admin + HeadAdmin)
========================= */
export const getSupport = async (req, res) => {
  try {
    const support = await Support.findOne({
      org_id: req.user.organization,
    });

    res.status(200).json(support);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* =========================
   CREATE SUPPORT (HeadAdmin)
========================= */
export const createSupport = async (req, res) => {
  try {
    const { email, phoneNo, address } = req.body;

    const exists = await Support.findOne({
      org_id: req.user.organization,
    });

    if (exists) {
      return res.status(400).json({
        message: 'Support details already exist for this organization',
      });
    }

    const support = await Support.create({
      org_id: req.user.organization,
      email,
      phoneNo,
      address,
      createdBy: req.user.id,
    });

    res.status(201).json(support);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* =========================
   UPDATE SUPPORT (HeadAdmin)
========================= */
export const updateSupport = async (req, res) => {
  try {
    const support = await Support.findOneAndUpdate(
      { org_id: req.user.organization },
      req.body,
      { new: true }
    );

    res.status(200).json(support);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* =========================
   DELETE SUPPORT (HeadAdmin)
========================= */
export const deleteSupport = async (req, res) => {
  try {
    await Support.findOneAndDelete({
      org_id: req.user.organization,
    });

    res.status(200).json({ message: 'Support details deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
