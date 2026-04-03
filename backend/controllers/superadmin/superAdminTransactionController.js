import RechargeTransaction from '../../models/RechargeTransaction.js';

/* =====================================================
   GET ALL TRANSACTIONS (READ ONLY)
===================================================== */
const getTransactions = async (req, res) => {
  try {
    const transactions = await RechargeTransaction.find()
      .sort({ date: -1 });

    const formatted = transactions.map((t) => ({
      _id: t._id,
      org_id: t.org_id || '—',
      user_id: t.user_id || '—',
      device_id: t.device_id || '—',
      txn_id: t.txn_id || '—',
      price: t.price || 0,
      currency: t.currency || 'INR',
      payment_gateway: t.payment_gateway || '—',
      status: t.status || '—',
      date: t.date,
    }));

    res.status(200).json(formatted);
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export { getTransactions };
