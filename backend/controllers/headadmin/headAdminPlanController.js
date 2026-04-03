import Plan from '../../models/Plan.js';
import ArchivedPlan from '../../models/ArchivedPlan.js';
import { ulid } from 'ulid'; // ✅ ULID PACKAGE

/* =========================
   CREATE PLAN
   HeadAdmin only
========================= */
export const createPlan = async (req, res) => {
  try {
    const { name, price, limit, validity, type } = req.body;

    // 🔒 Required fields validation
    if (!name || price == null || limit == null || !type) {
      return res.status(400).json({
        message: 'Name, price, limit and type are required',
      });
    }

    // 🔥 Validity validation
    let finalValidity = null;

    if (validity) {
      // If frontend sends "30 Days"
      const daysMatch = validity.match(/^(\d+)\s*Days$/i);

      if (daysMatch) {
        const days = Number(daysMatch[1]);

        if (days <= 0) {
          return res.status(400).json({
            message: 'Validity days must be greater than 0',
          });
        }

        finalValidity = `${days} Days`;
      } else {
        return res.status(400).json({
          message: 'Invalid validity format',
        });
      }
    }

    const plan = await Plan.create({
      plan_id: ulid(),
      org_id: req.user.organization,
      name: name.trim(),
      price: Number(price),
      limit: Number(limit),
      validity: finalValidity, // null = Unlimited
      type,
      created_by: req.user.id,
      created_at: new Date(),
    });

    return res.status(201).json(plan);
  } catch (err) {
    console.error('❌ CREATE PLAN ERROR:', err);
    return res.status(500).json({ message: err.message });
  }
};
/* =========================
   GET ACTIVE PLANS
   HeadAdmin + Admin
========================= */
export const getActivePlans = async (req, res) => {
  try {
    const plans = await Plan.find({
      org_id: req.user.organization,
    }).sort({ created_at: -1 });

    return res.status(200).json(plans);
  } catch (err) {
    console.error('❌ GET ACTIVE PLANS ERROR:', err);
    return res.status(500).json({ message: err.message });
  }
};

/* =========================
   GET ARCHIVED PLANS
   HeadAdmin + Admin
========================= */
export const getArchivedPlans = async (req, res) => {
  try {
    const plans = await ArchivedPlan.find({
      org_id: req.user.organization,
    }).sort({ modified_at: -1 });

    return res.status(200).json(plans);
  } catch (err) {
    console.error('❌ GET ARCHIVED PLANS ERROR:', err);
    return res.status(500).json({ message: err.message });
  }
};

/* =========================
   UPDATE PLAN
   → Archive old version
   → Update active plan
   HeadAdmin only
========================= */
export const updatePlan = async (req, res) => {
  try {
    const oldPlan = await Plan.findById(req.params.id);

    if (!oldPlan) {
      return res.status(404).json({ message: 'Plan not found' });
    }

    const {
      name,
      price,
      limit,
      validity,
      type,
    } = req.body;

    /* =========================
       🔒 VALIDATION
    ========================= */

    if (name !== undefined && !name.trim()) {
      return res.status(400).json({
        message: 'Plan name cannot be empty',
      });
    }

    if (price !== undefined && (isNaN(price) || Number(price) < 0)) {
      return res.status(400).json({
        message: 'Price must be a valid number',
      });
    }

    if (limit !== undefined && (isNaN(limit) || Number(limit) < 0)) {
      return res.status(400).json({
        message: 'Limit must be a valid number',
      });
    }

    let updatedValidity = oldPlan.validity;

    if (validity !== undefined) {
      if (!validity) {
        updatedValidity = null; // Unlimited
      } else {
        const days = parseInt(validity);
        if (isNaN(days) || days <= 0) {
          return res.status(400).json({
            message: 'Validity must be a positive number',
          });
        }
        updatedValidity = `${days} Days`;
      }
    }

    /* =========================
       1️⃣ ARCHIVE OLD VERSION
    ========================= */

    await ArchivedPlan.create({
      plan_id: oldPlan.plan_id,
      org_id: oldPlan.org_id,
      name: oldPlan.name,
      price: oldPlan.price,
      limit: oldPlan.limit,
      validity: oldPlan.validity,
      type: oldPlan.type,
      action: 'edited',
      modified_by: req.user.id,
      modified_at: new Date(),
    });

    /* =========================
       2️⃣ UPDATE ACTIVE PLAN
    ========================= */

    if (name !== undefined) oldPlan.name = name.trim();
    if (price !== undefined) oldPlan.price = Number(price);
    if (limit !== undefined) oldPlan.limit = Number(limit);
    if (type !== undefined) oldPlan.type = type;

    oldPlan.validity = updatedValidity;

    await oldPlan.save();

    return res.status(200).json(oldPlan);

  } catch (err) {
    console.error('❌ UPDATE PLAN ERROR:', err);
    return res.status(500).json({ message: err.message });
  }
};
/* =========================
   DELETE PLAN
   → Archive
   → Remove active
   HeadAdmin only
========================= */
export const deletePlan = async (req, res) => {
  try {
    const plan = await Plan.findById(req.params.id);

    if (!plan) {
      return res.status(404).json({ message: 'Plan not found' });
    }

    // ARCHIVE BEFORE DELETE
    await ArchivedPlan.create({
      plan_id: plan.plan_id,
      org_id: plan.org_id,
      name: plan.name,
      price: plan.price,
      limit: plan.limit,
      validity: plan.validity,
      type: plan.type,
      action: 'deleted',
      modified_by: req.user.id,
      modified_at: new Date(),
    });

    await plan.deleteOne();

    return res.status(200).json({
      message: 'Plan deleted and archived successfully',
    });
  } catch (err) {
    console.error('❌ DELETE PLAN ERROR:', err);
    return res.status(500).json({ message: err.message });
  }
};
