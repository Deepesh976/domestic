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

const purifiers = await OrgPurifier.aggregate([
  {
    $match: {
      org_id: orgId,
    },
  },
  {
    $lookup: {
      from: "org_users",
      localField: "user_id",
      foreignField: "user_id",
      as: "user_details",
    },
  },
  {
    $unwind: {
      path: "$user_details",
      preserveNullAndEmptyArrays: true,
    },
  },
]);

return res.status(200).json({
  purifiers,
});

  } catch (error) {
    console.error('❌ Get purifiers error:', error);
    return res.status(500).json({
      message: 'Failed to fetch purifiers',
    });
  }
};
