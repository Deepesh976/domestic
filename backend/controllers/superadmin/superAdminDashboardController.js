import Organization from '../../models/Organization.js';
import OrgAdmin from '../../models/OrgAdmin.js';
import OrgHeadAdmin from '../../models/OrgHeadAdmin.js';
import RechargeTransaction from '../../models/RechargeTransaction.js';
import Device from '../../models/Device.js';

/* =====================================================
   SUPER ADMIN DASHBOARD (ORG + YEAR BASED)
===================================================== */
export const getDashboardSummary = async (req, res) => {
  try {
    const { organizationId, year } = req.query;

    /* =========================
       VALIDATION
    ========================= */
    if (!organizationId || !year) {
      return res.status(400).json({
        message: 'organizationId and year are required',
      });
    }

    const org = await Organization.findById(organizationId);
    if (!org) {
      return res.status(404).json({
        message: 'Organization not found',
      });
    }

    /* =========================
       CORRECT ORG ID (CRITICAL)
    ========================= */
    const orgId =
      org.org_id ||
      org.organizationCode ||
      org.code ||
      org._id.toString();

    const startDate = new Date(`${year}-01-01T00:00:00.000Z`);
    const endDate = new Date(`${year}-12-31T23:59:59.999Z`);

    /* =========================
       COUNTS
    ========================= */
    const totalDevices = await Device.countDocuments({
      org_id: orgId,
    });

    const totalAdmins = await OrgAdmin.countDocuments({
      organization: organizationId,
    });

    const totalHeadAdmins = await OrgHeadAdmin.countDocuments({
      organization: organizationId,
    });

    /* =========================
       DEVICE GROWTH (MONTHLY)
       SOURCE: devices.createdAt
    ========================= */
    const deviceGrowth = await Device.aggregate([
      {
        $match: {
          org_id: orgId,
          createdAt: {
            $gte: startDate,
            $lte: endDate,
          },
        },
      },
      {
        $group: {
          _id: { $month: '$createdAt' },
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          month: '$_id',
          count: 1,
        },
      },
      { $sort: { month: 1 } },
    ]);

    /* =========================
       REVENUE GROWTH (MONTHLY)
    ========================= */
    const revenueGrowth = await RechargeTransaction.aggregate([
      {
        $match: {
          org_id: orgId,
          status: 'success',
          date: {
            $gte: startDate.getTime(),
            $lte: endDate.getTime(),
          },
        },
      },
      {
        $group: {
          _id: {
            month: { $month: { $toDate: '$date' } },
          },
          total: { $sum: '$price' },
        },
      },
      {
        $project: {
          _id: 0,
          month: '$_id.month',
          total: 1,
        },
      },
      { $sort: { month: 1 } },
    ]);

    /* =========================
       RESPONSE
    ========================= */
    return res.json({
      stats: {
        totalAdmins: totalAdmins + totalHeadAdmins,
        totalDevices,
      },
      deviceGrowth,    // [{ month: 1, count: 5 }]
      revenueGrowth,   // [{ month: 7, total: 149 }]
    });

  } catch (error) {
    console.error('Dashboard Error:', error);
    return res.status(500).json({
      message: 'Server error',
    });
  }
};
