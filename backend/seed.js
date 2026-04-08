require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const { resolveMongoUri } = require("./src/mongoUri");
const Admin = require("./src/models/Admin");
const Customer = require("./src/models/Customer");
const Vehicle = require("./src/models/Vehicle");
const Booking = require("./src/models/Booking");

function addDays(d, n) {
  const copy = new Date(d);
  copy.setDate(copy.getDate() + n);
  return copy;
}

async function run() {
  const resolved = resolveMongoUri();
  if (!resolved.ok) throw new Error(resolved.error);

  await mongoose.connect(resolved.uri);

  // Clean slate (demo convenience)
  await Promise.all([
    Admin.deleteMany({}),
    Customer.deleteMany({}),
    Vehicle.deleteMany({}),
    Booking.deleteMany({}),
  ]);

  const adminEmail = "admin@bindot.local";
  const adminPassword = "admin123";
  const passwordHash = await bcrypt.hash(adminPassword, 12);
  await Admin.create({ email: adminEmail, passwordHash });

  const customers = await Customer.insertMany([
    { name: "Ali Khan", email: "ali@example.com", phone: "+92 300 0000001" },
    { name: "Sara Ahmed", email: "sara@example.com", phone: "+92 300 0000002" },
    { name: "Usman Raza", email: "usman@example.com", phone: "+92 300 0000003" },
  ]);

  const vehicles = await Vehicle.insertMany([
    { make: "Toyota", model: "Corolla", year: 2020, plateNumber: "ABC-123", dailyRate: 45, isActive: true },
    { make: "Honda", model: "Civic", year: 2019, plateNumber: "XYZ-987", dailyRate: 55, isActive: true },
    { make: "Suzuki", model: "Alto", year: 2021, plateNumber: "ALT-456", dailyRate: 25, isActive: true },
  ]);

  const today = new Date();
  const b1Start = addDays(today, 0);
  const b1End = addDays(today, 1);
  const b2Start = addDays(today, 3);
  const b2End = addDays(today, 3);

  const bookings = [
    {
      customer: customers[0]._id,
      vehicle: vehicles[0]._id,
      startDate: b1Start,
      endDate: b1End,
      dailyRate: vehicles[0].dailyRate,
    },
    {
      customer: customers[1]._id,
      vehicle: vehicles[1]._id,
      startDate: b2Start,
      endDate: b2End,
      dailyRate: vehicles[1].dailyRate,
    },
  ];

  await Booking.insertMany(
    bookings.map((b) => {
      const ms = b.endDate.getTime() - b.startDate.getTime();
      const days = Math.max(1, Math.ceil(ms / (1000 * 60 * 60 * 24)) + 1);
      const totalAmount = Math.round(b.dailyRate * days * 100) / 100;
      return { ...b, totalAmount };
    })
  );

  console.log("Seed complete.");
  console.log(`Admin: ${adminEmail} / ${adminPassword}`);
}

run()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });

