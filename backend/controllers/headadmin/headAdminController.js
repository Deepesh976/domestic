import OrgHeadAdmin from '../../models/OrgHeadAdmin.js';
import OrgAdmin from '../../models/OrgAdmin.js';

/* =========================
   GET HEAD ADMIN PROFILE
========================= */
export const getProfile = async (req, res) => {
  try {
    // 🔹 Set by roleMiddleware
    const headAdmin = req.currentUser;

    if (!headAdmin) {
      return res.status(404).json({ message: 'Head Admin not found' });
    }

    // Optional populate if needed
    await headAdmin.populate('organization', 'organizationName email');

    res.status(200).json(headAdmin);
  } catch (error) {
    console.error('HeadAdmin Profile Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/* =========================
   GET ADMINS UNDER THIS ORGANIZATION
========================= */
export const getOrganizationAdmins = async (req, res) => {
  try {
    // 🔹 Already validated HeadAdmin
    const headAdmin = req.currentUser;

    const admins = await OrgAdmin.find({
      organization: headAdmin.organization,
    }).select('-password');

    res.status(200).json(admins);
  } catch (error) {
    console.error('Get Org Admins Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
