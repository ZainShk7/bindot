const express = require("express");
const Customer = require("../models/Customer");
const { asyncHandler } = require("../utils/asyncHandler");

const router = express.Router();

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const items = await Customer.find().sort({ createdAt: -1 });
    res.json({ items });
  })
);

router.post(
  "/",
  asyncHandler(async (req, res) => {
    const { name, email, phone, notes } = req.body || {};
    if (!name || String(name).trim().length < 2) {
      return res.status(400).json({ message: "name is required (min 2 chars)" });
    }
    const created = await Customer.create({ name, email, phone, notes });
    res.status(201).json({ item: created });
  })
);

router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const item = await Customer.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Customer not found" });
    res.json({ item });
  })
);

router.put(
  "/:id",
  asyncHandler(async (req, res) => {
    const { name, email, phone, notes } = req.body || {};
    if (name != null && String(name).trim().length < 2) {
      return res.status(400).json({ message: "name must be at least 2 characters" });
    }
    const item = await Customer.findByIdAndUpdate(
      req.params.id,
      { name, email, phone, notes },
      { new: true, runValidators: true }
    );
    if (!item) return res.status(404).json({ message: "Customer not found" });
    res.json({ item });
  })
);

router.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    const item = await Customer.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ message: "Customer not found" });
    res.json({ ok: true });
  })
);

module.exports = router;

