import DailyPurifierLog from '../../models/DailyPurifierLog.js';
import OrgPurifier from '../../models/OrgPurifier.js';
import OrgUser from '../../models/OrgUser.js';

/* =====================================================
   GET PURIFIER HISTORY (ADMIN + HEADADMIN)
===================================================== */
export const getPurifierHistory = async (req, res) => {
  try {
    const { deviceId } = req.params;
    const { from, to } = req.query;
    const orgId = req.user.organization;

    if (!orgId) {
      return res.status(401).json({
        message: 'Organization missing in token',
      });
    }

    // Build History Query with Optional From/To filters
    const query = {
      'metadata.device_id': deviceId,
    };

    if (from || to) {
      query.timestamp = {};
      if (from) query.timestamp.$gte = new Date(from);
      if (to) {
        // Set to end of the day
        const toDate = new Date(to);
        toDate.setHours(23, 59, 59, 999);
        query.timestamp.$lte = toDate;
      }
    }

    const history = await DailyPurifierLog.find(query)
      .sort({ timestamp: -1 })
      .limit(500);

    // Fetch Purifier and User (for Full Location)
    const purifier = await OrgPurifier.findOne({
      device_id: deviceId,
      org_id: orgId,
    });

    let customer = null;
    if (purifier && purifier.user_id) {
      customer = await OrgUser.findOne({
        user_id: purifier.user_id,
        org_id: orgId,
      }).select('user_name address phone_number email_address');
    }

    return res.status(200).json({
      device_id: deviceId,
      history,
      purifier,
      customer,
    });
  } catch (error) {
    console.error('❌ Purifier history error:', error);
    return res.status(500).json({
      message: 'Failed to fetch purifier history',
    });
  }
};
