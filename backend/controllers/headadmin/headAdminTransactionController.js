import RechargeTransaction from '../../models/RechargeTransaction.js';
import { ulid } from 'ulid';

/* =====================================================
   CREATE TRANSACTION
===================================================== */
export const createRechargeTransaction = async (req, res) => {
  try {
    const org_id = req.user.organization;

    const {
      user_id,
      device_id,
      plan_id,
      amount,
      payment_mode,
      payment_status,
      payment_purpose,
    } = req.body;

    /* =========================
       VALIDATION
    ========================= */
    if (!user_id || !amount || !payment_mode || !payment_status) {
      return res.status(400).json({
        message: 'Required fields missing',
      });
    }

    /* =========================
       CREATE
    ========================= */
    const newTxn = await RechargeTransaction.create({
      user_id, // ✅ UUID string
      org_id,

      device_id: device_id || null,
      plan_id: plan_id || null,

      txn_id: ulid(),
      order_id: ulid(),

      amount,
      payment_mode,
      payment_status,
      payment_purpose: payment_purpose || 'Recharge',
    });

    res.status(201).json({
      message: 'Transaction created successfully',
      transaction: newTxn,
    });

  } catch (err) {
    console.error('❌ CREATE TXN ERROR:', err);
    res.status(500).json({
      message: 'Failed to create transaction',
    });
  }
};


/* =====================================================
   GET TRANSACTIONS
===================================================== */
export const getRechargeTransactions = async (req, res) => {
  try {
    const { device_id } = req.query;

    const matchStage = {
      org_id: req.user.organization,
    };

    if (device_id) {
      matchStage.device_id = device_id;
    }

    const transactions = await RechargeTransaction.aggregate([
      { $match: matchStage },

      /* =========================
         USER JOIN (FIXED FOR UUID)
      ========================= */
      {
        $lookup: {
          from: 'org_users',
          localField: 'user_id',
          foreignField: 'user_id', // ✅ FIXED (IMPORTANT)
          as: 'user_info',
        },
      },

      {
        $unwind: {
          path: '$user_info',
          preserveNullAndEmptyArrays: true,
        },
      },

      {
        $addFields: {
          user_name: {
            $trim: {
              input: {
                $concat: [
                  { $ifNull: ['$user_info.user_name.first_name', ''] },
                  ' ',
                  { $ifNull: ['$user_info.user_name.last_name', ''] },
                ],
              },
            },
          },
        },
      },

      /* =========================
         PLAN JOIN
      ========================= */
      {
        $lookup: {
          from: 'active_plans',
          localField: 'plan_id',
          foreignField: 'plan_id',
          as: 'plan_info',
        },
      },

      {
        $addFields: {
          plan_name: {
            $ifNull: [
              { $arrayElemAt: ['$plan_info.name', 0] },
              '-',
            ],
          },
        },
      },

      /* =========================
         HANDLE DATE (IMPORTANT)
      ========================= */
      {
        $addFields: {
          createdAt: {
            $ifNull: ['$createdAt', '$created_at'], // ✅ handles both cases
          },
        },
      },

      /* =========================
         FINAL OUTPUT
      ========================= */
      {
        $project: {
          _id: 1,
          txn_id: 1,
          order_id: 1,
          amount: 1,
          payment_mode: 1,
          payment_status: 1,
          payment_purpose: 1,
          plan_name: 1,
          user_name: 1,
          createdAt: 1,
        },
      },

      { $sort: { createdAt: -1 } },
    ]);

    res.json({
      count: transactions.length,
      transactions,
    });

  } catch (err) {
    console.error('❌ GET TXN ERROR:', err);
    res.status(500).json({
      message: 'Failed to load transactions',
    });
  }
};

/* =====================================================
   GET TRANSACTIONS BY USER
===================================================== */
export const getTransactionsByUser = async (req, res) => {
  try {
    const org_id = req.user.organization;
    const { user_id } = req.params;

    const transactions = await RechargeTransaction.find({
      org_id,
      user_id,
      payment_status: 'Success',
    })
      .select('txn_id amount payment_mode payment_status createdAt')
      .sort({ createdAt: -1 });

    res.status(200).json({
      transactions,
    });

  } catch (err) {
    console.error('❌ GET USER TRANSACTIONS ERROR:', err);

    res.status(500).json({
      message: 'Failed to fetch user transactions',
    });
  }
};


/* =====================================================
   DELETE TRANSACTION
===================================================== */
export const deleteRechargeTransaction = async (req, res) => {
  try {
    const org_id = req.user.organization;
    const { id } = req.params;

    const txn = await RechargeTransaction.findOneAndDelete({
      _id: id,
      org_id,
    });

    if (!txn) {
      return res.status(404).json({
        message: 'Transaction not found',
      });
    }

    res.json({
      message: 'Transaction deleted successfully',
    });

  } catch (err) {
    console.error('❌ DELETE TXN ERROR:', err);
    res.status(500).json({
      message: 'Failed to delete transaction',
    });
  }
};