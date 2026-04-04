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
  txn_id: t.txn_id || '—',

  amount: t.amount || 0,
  payment_mode: t.payment_mode || '—',
  payment_status: t.payment_status || '—',
  created_at: t.created_at,
}));

    res.status(200).json(formatted);
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export { getTransactions };
