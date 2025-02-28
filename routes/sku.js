const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const ability = require("../middleware/ability");
const SKU = require("../models/SKU");

// Protected route with RBAC
router.post("/", auth, ability, async (req, res) => {
  try {
    if (!req.ability.can("create", "SKU")) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const sku = new SKU({
      ...req.body,
      createdBy: req.user._id,
    });

    await sku.save();
    res.status(201).json(sku);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get all SKUs with access control
router.get("/", auth, ability, async (req, res) => {
  try {
    const filter = req.user.role === "admin" ? {} : { createdBy: req.user._id };
    const skus = await SKU.find(filter);
    res.json(skus);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
