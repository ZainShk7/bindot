const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");
const { asyncHandler } = require("../utils/asyncHandler");

const router = express.Router();

function signToken(admin) {
  return jwt.sign({ sub: admin._id.toString(), email: admin.email }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
}

router.post(
  "/signup",
  asyncHandler(async (req, res) => {
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ message: "email and password are required" });

    const existing = await Admin.findOne({ email: email.toLowerCase() });
    if (existing) return res.status(409).json({ message: "Admin already exists" });

    const passwordHash = await bcrypt.hash(password, 12);
    const admin = await Admin.create({ email, passwordHash });

    return res.status(201).json({ token: signToken(admin) });
  })
);

router.post(
  "/login",
  asyncHandler(async (req, res) => {
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ message: "email and password are required" });

    const admin = await Admin.findOne({ email: email.toLowerCase() });
    if (!admin) return res.status(401).json({ message: "Invalid credentials" });

    const ok = await bcrypt.compare(password, admin.passwordHash);
    if (!ok) return res.status(401).json({ message: "Invalid credentials" });

    return res.json({ token: signToken(admin) });
  })
);

module.exports = router;

