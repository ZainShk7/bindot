const express = require("express");
const Booking = require("../models/Booking");
const Customer = require("../models/Customer");
const Vehicle = require("../models/Vehicle");
const { asyncHandler } = require("../utils/asyncHandler");

const router = express.Router();

router.get(
  "/summary",
  asyncHandler(async (req, res) => {
    const [bookingsCount, customersCount, vehiclesCount, revenueAgg] = await Promise.all([
      Booking.countDocuments(),
      Customer.countDocuments(),
      Vehicle.countDocuments(),
      Booking.aggregate([{ $group: { _id: null, revenue: { $sum: "$totalAmount" } } }]),
    ]);

    const revenue = revenueAgg?.[0]?.revenue || 0;
    res.json({
      bookingsCount,
      customersCount,
      vehiclesCount,
      revenue,
    });
  })
);

module.exports = router;

