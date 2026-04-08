const express = require("express");
const Booking = require("../models/Booking");
const Vehicle = require("../models/Vehicle");
const Customer = require("../models/Customer");
const { asyncHandler } = require("../utils/asyncHandler");

const router = express.Router();

function parseDateOrNull(value) {
  const d = new Date(value);
  if (!value || Number.isNaN(d.getTime())) return null;
  return d;
}

function calcDays(startDate, endDate) {
  const s = new Date(startDate);
  const e = new Date(endDate);
  const ms = e.getTime() - s.getTime();
  const days = Math.ceil(ms / (1000 * 60 * 60 * 24)) + 1; // inclusive
  return Math.max(1, days);
}

async function ensureNoOverlap({ vehicleId, startDate, endDate, excludeId }) {
  const query = {
    vehicle: vehicleId,
    startDate: { $lte: new Date(endDate) },
    endDate: { $gte: new Date(startDate) },
  };
  if (excludeId) query._id = { $ne: excludeId };
  const conflict = await Booking.findOne(query).select({ _id: 1 }).lean();
  if (conflict) {
    const err = new Error("Vehicle already booked for selected dates");
    err.statusCode = 409;
    throw err;
  }
}

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const items = await Booking.find()
      .populate("customer")
      .populate("vehicle")
      .sort({ createdAt: -1 });
    res.json({ items });
  })
);

router.post(
  "/",
  asyncHandler(async (req, res) => {
    const { customerId, vehicleId, startDate, endDate, dailyRate } = req.body || {};
    if (!customerId || !vehicleId || !startDate || !endDate) {
      return res.status(400).json({ message: "customerId, vehicleId, startDate, endDate are required" });
    }

    const s = parseDateOrNull(startDate);
    const e = parseDateOrNull(endDate);
    if (!s || !e) return res.status(400).json({ message: "startDate and endDate must be valid dates" });
    if (e < s) return res.status(400).json({ message: "endDate must be on/after startDate" });

    const [customer, vehicle] = await Promise.all([
      Customer.findById(customerId),
      Vehicle.findById(vehicleId),
    ]);
    if (!customer) return res.status(404).json({ message: "Customer not found" });
    if (!vehicle) return res.status(404).json({ message: "Vehicle not found" });
    if (vehicle.isActive === false) return res.status(409).json({ message: "Vehicle is inactive" });

    await ensureNoOverlap({ vehicleId, startDate: s, endDate: e });

    const rate = dailyRate != null ? Number(dailyRate) : vehicle.dailyRate;
    if (!Number.isFinite(rate) || rate < 0) return res.status(400).json({ message: "dailyRate must be >= 0" });
    const days = calcDays(s, e);
    const totalAmount = Math.round(rate * days * 100) / 100;

    const created = await Booking.create({
      customer: customer._id,
      vehicle: vehicle._id,
      startDate: s,
      endDate: e,
      dailyRate: rate,
      totalAmount,
    });

    const populated = await Booking.findById(created._id).populate("customer").populate("vehicle");
    res.status(201).json({ item: populated });
  })
);

router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const item = await Booking.findById(req.params.id).populate("customer").populate("vehicle");
    if (!item) return res.status(404).json({ message: "Booking not found" });
    res.json({ item });
  })
);

router.put(
  "/:id",
  asyncHandler(async (req, res) => {
    const { customerId, vehicleId, startDate, endDate, dailyRate } = req.body || {};
    const existing = await Booking.findById(req.params.id);
    if (!existing) return res.status(404).json({ message: "Booking not found" });

    const nextCustomerId = customerId || existing.customer;
    const nextVehicleId = vehicleId || existing.vehicle;
    const nextStartDate = startDate ? parseDateOrNull(startDate) : new Date(existing.startDate);
    const nextEndDate = endDate ? parseDateOrNull(endDate) : new Date(existing.endDate);
    if (!nextStartDate || !nextEndDate) return res.status(400).json({ message: "startDate and endDate must be valid dates" });
    if (nextEndDate < nextStartDate) return res.status(400).json({ message: "endDate must be on/after startDate" });

    await ensureNoOverlap({
      vehicleId: nextVehicleId,
      startDate: nextStartDate,
      endDate: nextEndDate,
      excludeId: existing._id,
    });

    const [customer, vehicle] = await Promise.all([
      Customer.findById(nextCustomerId),
      Vehicle.findById(nextVehicleId),
    ]);
    if (!customer) return res.status(404).json({ message: "Customer not found" });
    if (!vehicle) return res.status(404).json({ message: "Vehicle not found" });
    if (vehicle.isActive === false) return res.status(409).json({ message: "Vehicle is inactive" });

    const rate = dailyRate != null ? Number(dailyRate) : existing.dailyRate;
    if (!Number.isFinite(rate) || rate < 0) return res.status(400).json({ message: "dailyRate must be >= 0" });
    const days = calcDays(nextStartDate, nextEndDate);
    const totalAmount = Math.round(rate * days * 100) / 100;

    existing.customer = customer._id;
    existing.vehicle = vehicle._id;
    existing.startDate = nextStartDate;
    existing.endDate = nextEndDate;
    existing.dailyRate = rate;
    existing.totalAmount = totalAmount;

    await existing.save();
    const populated = await Booking.findById(existing._id).populate("customer").populate("vehicle");
    res.json({ item: populated });
  })
);

router.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    const item = await Booking.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ message: "Booking not found" });
    res.json({ ok: true });
  })
);

module.exports = router;

