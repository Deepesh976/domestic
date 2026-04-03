import RechargedPlan from '../../models/RechargedPlan.js';

/**
 * =====================================================
 * GET RECHARGED PLANS
 * - Reads from recharged_plans
 * - Fetches plan name from active_plans.name
 * =====================================================
 */
export const getRechargedPlans = async (req, res) => {
  try {
    if (!req.user?.organization) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { device_id } = req.query;

    const matchStage = {
      org_id: req.user.organization,
    };

    if (device_id) {
      matchStage.device_id = device_id;
    }

    const rechargedPlans = await RechargedPlan.aggregate([
      { $match: matchStage },

      /* =========================
         LOOKUP ACTIVE PLANS
      ========================= */
      {
        $lookup: {
          from: 'active_plans', // ✅ CORRECT COLLECTION NAME
          let: {
            pid: '$plan_id',
            org: '$org_id',
          },
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
                name: 1, // ✅ CORRECT FIELD
                _id: 0,
              },
            },
          ],
          as: 'active_plan_info',
        },
      },

      /* =========================
         EXTRACT PLAN NAME
      ========================= */
      {
        $addFields: {
          plan_name: {
            $ifNull: [
              { $arrayElemAt: ['$active_plan_info.name', 0] },
              'Unknown Plan',
            ],
          },
        },
      },

      /* =========================
         CLEAN RESPONSE
      ========================= */
      {
        $project: {
          active_plan_info: 0,
        },
      },

      { $sort: { createdAt: -1 } },
    ]);

    return res.status(200).json(rechargedPlans);
  } catch (error) {
    console.error('❌ RECHARGED PLAN ERROR:', error);
    return res.status(500).json({
      message: 'Failed to fetch recharged plans',
    });
  }
};
