import RechargedPlan from '../../models/RechargedPlan.js';

/**
 * GET RECHARGED PLANS
 * /api/headadmin/recharged-plans?device_id=RO_10002
 */
export const getRechargedPlans = async (req, res) => {
  try {
    const { device_id } = req.query;

    const filter = {
      org_id: req.user.organization, // 🔐 security
    };

    // ✅ FILTER BY DEVICE IF PASSED
    if (device_id) {
      filter.device_id = device_id;
    }

    const plans = await RechargedPlan.find(filter)
      .sort({ createdAt: -1 });

    return res.json(plans);
  } catch (error) {
    console.error('❌ RECHARGED PLAN ERROR:', error);
    return res.status(500).json({
      message: 'Failed to fetch recharged plans',
    });
  }
};
