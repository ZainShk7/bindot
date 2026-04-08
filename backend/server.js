require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();

// Allow any origin (local + deployed frontends). Do not use credentials: true with origin "*".
app.use(
  cors({
    origin: "*",
    methods: ["GET", "HEAD", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    optionsSuccessStatus: 204,
  })
);
app.use(express.json());

const health = (req, res) => res.json({ ok: true });
app.get("/health", health);
app.get("/api/health", health);

const { resolveMongoUri } = require("./src/mongoUri");

let mongoPromise = null;
function ensureMongo() {
  if (mongoose.connection.readyState === 1) return Promise.resolve();
  const resolved = resolveMongoUri();
  if (!resolved.ok) return Promise.reject(new Error(resolved.error));
  if (!mongoPromise) {
    mongoPromise = mongoose.connect(resolved.uri);
  }
  return mongoPromise;
}

app.use(async (req, res, next) => {
  try {
    await ensureMongo();
    next();
  } catch (err) {
    next(err);
  }
});

const { notFound, errorHandler } = require("./src/middleware/errors");
const { authRequired } = require("./src/middleware/auth");

app.use("/api/auth", require("./src/routes/auth"));
app.use("/api/customers", authRequired, require("./src/routes/customers"));
app.use("/api/vehicles", authRequired, require("./src/routes/vehicles"));
app.use("/api/bookings", authRequired, require("./src/routes/bookings"));
app.use("/api/dashboard", authRequired, require("./src/routes/dashboard"));

app.use(notFound);
app.use(errorHandler);

// Default 5050 — macOS often uses 5000 for AirPlay Receiver, which returns 403 to HTTP clients.
const PORT = process.env.PORT || 5050;

if (require.main === module) {
  ensureMongo()
    .then(() => {
      app.listen(PORT, () => console.log(`API running on ${PORT}`));
    })
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}

module.exports = app;