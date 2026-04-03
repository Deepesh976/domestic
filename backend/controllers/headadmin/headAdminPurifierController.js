import OrgPurifier from '../../models/OrgPurifier.js';
import OrgUser from '../../models/OrgUser.js';

/* =====================================================
   GET ORG PURIFIERS (ADMIN + HEADADMIN)
===================================================== */
export const getPurifiers = async (req, res) => {
  try {
    /* =========================
       ORG FROM JWT (SOURCE OF TRUTH)
    ========================= */
    const orgId = req.user.organization;

    if (!orgId) {
      return res.status(401).json({
        message: 'Organization not found in token',
      });
    }

    /* =========================
       FETCH PURIFIERS
    ========================= */
    const purifiers = await OrgPurifier.find({
      org_id: orgId,
    }).sort({ createdAt: -1 });

    /* =========================
       ATTACH USER DETAILS
    ========================= */
    const enriched = await Promise.all(
      purifiers.map(async (p) => {
        let userDetails = null;

        if (p.user_id) {
          const user = await OrgUser.findOne({
            user_id: p.user_id, // string match
            org_id: orgId,
          }).select('-password');

          if (user) {
            userDetails = user;
          }
        }

        return {
          ...p.toObject(),
          user_details: userDetails, // used by frontend modal
        };
      })
    );

    return res.status(200).json({
      purifiers: enriched,
    });
  } catch (error) {
    console.error('❌ Get purifiers error:', error);
    return res.status(500).json({
      message: 'Failed to fetch purifiers',
    });
  }
};
