import OrgUser from '../../models/OrgUser.js';
import OrgPurifier from '../../models/OrgPurifier.js';
import OrgTechnician from '../../models/OrgTechnician.js';
import InstallationOrder from '../../models/InstallationOrder.js';

/* =====================================================
   HEAD ADMIN DASHBOARD — INSTALLATION ORDER BASED
===================================================== */
export const getDashboard = async (req, res) => {
  try {
    const org_id = req.user.organization;

    const purifierYear = Number(req.query.purifierYear);
    const planYear = req.query.planYear ? Number(req.query.planYear) : null;
    const planMonth = req.query.planMonth ? Number(req.query.planMonth) : null;

    if (!org_id || !purifierYear) {
      return res.status(400).json({ message: 'Missing required params' });
    }

    /* =========================
       BASIC STATS
    ========================= */
    const totalCustomers = await OrgUser.countDocuments({ org_id });
    const totalTechnicians = await OrgTechnician.countDocuments({ org_id });

    /* =========================
       PURIFIER CREATION GROWTH
    ========================= */
    const purifierStart = new Date(Date.UTC(purifierYear, 0, 1));
    const purifierEnd = new Date(Date.UTC(purifierYear, 11, 31, 23, 59, 59));

    const purifierRaw = await OrgPurifier.aggregate([
      {
        $match: {
          org_id,
          created_at: { $gte: purifierStart, $lte: purifierEnd },
        },
      },
      {
        $group: {
          _id: { month: { $month: '$created_at' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.month': 1 } },
    ]);

    const purifierGrowth = Array.from({ length: 12 }, (_, i) => ({
      month: new Date(purifierYear, i).toLocaleString('en-IN', {
        month: 'short',
      }),
      purifiers: 0,
    }));

    purifierRaw.forEach((r) => {
      purifierGrowth[r._id.month - 1].purifiers = r.count;
    });

    /* =========================
       TRENDING PLANS
       - If year + month selected → filter by month
       - If nothing selected → show ALL TIME
    ========================= */

    let dateFilter = {};

    if (planYear && planMonth) {
      const monthStart = new Date(planYear, planMonth - 1, 1);
      const monthEnd = new Date(planYear, planMonth, 1);

      dateFilter = {
        createdAt: { $gte: monthStart, $lt: monthEnd },
      };
    }

const trendingPlans = await InstallationOrder.aggregate([
  {
    $match: {
      org_id,
      ...dateFilter,
    },
  },

  // 🔥 Lookup plan name
  {
    $lookup: {
      from: 'active_plans',   // ⚠️ Make sure this matches your actual collection name
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
          '$plan_id', // fallback if not found
        ],
      },
    },
  },

  {
    $group: {
      _id: '$plan_name',
      count: { $sum: 1 },
      firstUsedOn: { $min: '$createdAt' },
      lastUsedOn: { $max: '$createdAt' },
    },
  },

  {
    $project: {
      _id: 0,
      plan: '$_id',
      count: 1,
      firstUsedOn: 1,
      lastUsedOn: 1,
    },
  },

  { $sort: { count: -1 } },
]);

    console.log('📊 INSTALLATION ORDER PIE DATA:', trendingPlans);

    return res.json({
      stats: { totalCustomers, totalTechnicians },
      purifierGrowth,
      trendingPlans,
    });

  } catch (error) {
    console.error('❌ DASHBOARD ERROR:', error);
    return res.status(500).json({ message: 'Dashboard failed' });
  }
};