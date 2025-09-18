const express = require("express");
const { auth } = require("../middleware/auth");
const Tenant = require("../models/Tenant");
const router = express.Router();

router.post("/:slug/upgrade", auth, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Only admins can upgrade tenants" });
    }

    const tenant = await Tenant.findOne({ slug: req.params.slug });

    if (!tenant) {
      return res.status(404).json({ message: "Tenant not found" });
    }

    if (tenant.plan === "pro") {
      return res.status(400).json({ message: "Tenant is already on Pro plan" });
    }

    tenant.plan = "pro";
    await tenant.save();

    res.json({ message: "Tenant upgraded to Pro successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
