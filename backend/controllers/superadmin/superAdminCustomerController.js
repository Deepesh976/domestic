import OrgUser from '../../models/OrgUser.js';

/* =====================================
   GET ALL CUSTOMERS (VIEW ONLY)
===================================== */
const getCustomers = async (req, res) => {
  try {
    const customers = await OrgUser.find(
      {},
      {
        org_id: 1,
        email_address: 1,
        phone_number: 1,
        user_name: 1,
        address: 1,
      }
    ).sort({ createdAt: -1 });

const formattedCustomers = customers.map((c) => ({
  _id: c._id,
  createdAt: c.createdAt,   // ✅ ADD THIS
  org_id: c.org_id || '—',

      name: c.user_name
        ? `${c.user_name.first_name || ''} ${c.user_name.last_name || ''}`.trim()
        : '—',

      email: c.email_address || '—',
      phone: c.phone_number || '—',
      city: c.address?.city || '—',
      state: c.address?.state || '—',
    }));

    return res.status(200).json(formattedCustomers);
  } catch (error) {
    console.error('Get customers error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

export { getCustomers };
