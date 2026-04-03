import RechargeTransaction from '../../models/RechargeTransaction.js';

/* =========================
   GET RECHARGE TRANSACTIONS
   HeadAdmin only
   Org scoped 🔐
========================= */
export const getRechargeTransactions = async (req, res) => {
  try {
    const { device_id } = req.query;

    const matchStage = {
      org_id: req.user.organization,
    };

    // optional filter
    if (device_id) {
      matchStage.device_id = device_id;
    }

    const transactions = await RechargeTransaction.aggregate([
      { $match: matchStage },

      /* =========================
         JOIN USER (org_users)
      ========================= */
      {
        $lookup: {
          from: 'org_users',
          let: { uid: '$user_id', org: '$org_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$user_id', '$$uid'] },
                    { $eq: ['$org_id', '$$org'] },
                  ],
                },
              },
            },
            {
              $project: {
                first_name: '$user_name.first_name',
                last_name: '$user_name.last_name',
                _id: 0,
              },
            },
          ],
          as: 'user_info',
        },
      },

      {
        $addFields: {
          user_name: {
            $trim: {
              input: {
                $concat: [
                  { $ifNull: [{ $arrayElemAt: ['$user_info.first_name', 0] }, ''] },
                  ' ',
                  { $ifNull: [{ $arrayElemAt: ['$user_info.last_name', 0] }, ''] },
                ],
              },
            },
          },
        },
      },

      /* =========================
         JOIN PLAN (active_plans)
      ========================= */
      {
        $lookup: {
          from: 'active_plans',
          let: { pid: '$plan_id', org: '$org_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$plan_id', '$$pid'] },
                    { $eq: ['$org_id', '$$org'] },
                  ],
                },
              },
            },
            {
              $project: {
                name: 1,
                _id: 0,
              },
            },
          ],
          as: 'plan_info',
        },
      },

      {
        $addFields: {
          plan_name: {
            $ifNull: [
              { $arrayElemAt: ['$plan_info.name', 0] },
              'Unknown Plan',
            ],
          },
        },
      },

      /* =========================
         FINAL RESPONSE CLEANUP
      ========================= */
{
  $project: {
    _id: 1,
    txn_id: 1,
    amount: 1,
    payment_mode: 1,
    payment_status: 1,
    plan_name: 1,
    user_name: 1,
    created_at: 1,
  },
},

      { $sort: { created_at: -1 } },
    ]);

    return res.json(transactions);
  } catch (err) {
    console.error('❌ RECHARGE TXN ERROR:', err);
    return res.status(500).json({
      message: 'Failed to load transactions',
    });
  }
};