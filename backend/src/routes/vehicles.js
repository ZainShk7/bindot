const express = require("express");
const Vehicle = require("../models/Vehicle");
const Booking = require("../models/Booking");
const { asyncHandler } = require("../utils/asyncHandler");

const router = express.Router();

router.get(
  "/available",
  asyncHandler(async (req, res) => {
    const { startDate, endDate } = req.query || {};
    if (!startDate || !endDate) {
      return res.status(400).json({ message: "startDate and endDate are required (YYYY-MM-DD)" });
    }

    const s = new Date(startDate);
    const e = new Date(endDate);
    if (Number.isNaN(s.getTime()) || Number.isNaN(e.getTime())) {
      return res.status(400).json({ message: "Invalid date range" });
    }

    const bookedVehicleIds = await Booking.distinct("vehicle", {
      startDate: { $lte: e },
      endDate: { $gte: s },
    });

    const items = await Vehicle.find({
      isActive: true,
      _id: { $nin: bookedVehicleIds },
    }).sort({ createdAt: -1 });

    res.json({ items });
  })
);

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const items = await Vehicle.find().sort({ createdAt: -1 });
    res.json({ items });
  })
);

router.post(
  "/",
  asyncHandler(async (req, res) => {
    const { make, model, year, plateNumber, dailyRate, isActive } = req.body || {};
    if (!make || !model || !plateNumber || dailyRate == null) {
      return res.status(400).json({ message: "make, model, plateNumber, dailyRate are required" });
    }
    const rate = Number(dailyRate);
    if (!Number.isFinite(rate) || rate < 0) return res.status(400).json({ message: "dailyRate must be >= 0" });
    const yr = year != null && year !== "" ? Number(year) : undefined;
    if (yr != null && (!Number.isInteger(yr) || yr < 1900 || yr > 2100)) {
      return res.status(400).json({ message: "year must be a valid year" });
    }
    const created = await Vehicle.create({ make, model, year, plateNumber, dailyRate, isActive });
    res.status(201).json({ item: created });
  })
);

router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const item = await Vehicle.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Vehicle not found" });
    res.json({ item });
  })
);

router.put(
  "/:id",
  asyncHandler(async (req, res) => {
    const { make, model, year, plateNumber, dailyRate, isActive } = req.body || {};
    if (dailyRate != null) {
      const rate = Number(dailyRate);
      if (!Number.isFinite(rate) || rate < 0) return res.status(400).json({ message: "dailyRate must be >= 0" });
    }
    if (year != null && year !== "") {
      const yr = Number(year);
      if (!Number.isInteger(yr) || yr < 1900 || yr > 2100) return res.status(400).json({ message: "year must be a valid year" });
    }
    const item = await Vehicle.findByIdAndUpdate(
      req.params.id,
      { make, model, year, plateNumber, dailyRate, isActive },
      { new: true, runValidators: true }
    );
    if (!item) return res.status(404).json({ message: "Vehicle not found" });
    res.json({ item });
  })
);

router.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    const item = await Vehicle.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ message: "Vehicle not found" });
    res.json({ ok: true });
  })
);

module.exports = router;

