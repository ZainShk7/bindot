/**
 * Single place to read the Mongo connection string.
 * Vercel sets VERCEL=1 — localhost URIs cannot work there (no local MongoDB).
 */
function resolveMongoUri() {
  const raw =
    process.env.MONGO_URI ||
    process.env.MONGODB_URI ||
    process.env.DATABASE_URL;

  if (!raw || typeof raw !== "string") {
    return {
      ok: false,
      error:
        "Database URL missing. Set MONGO_URI (or MONGODB_URI / DATABASE_URL) in the environment — for Vercel, add it under Project → Settings → Environment Variables for Production (and attach it to all services if Vercel asks).",
    };
  }

  const uri = raw.trim();
  if (!uri) {
    return { ok: false, error: "Database URL is empty." };
  }

  if (process.env.VERCEL === "1" && /(127\.0\.0\.1|\blocalhost\b)/i.test(uri)) {
    return {
      ok: false,
      error:
        "MONGO_URI points to localhost. Replace it with your MongoDB Atlas connection string (mongodb+srv://...) in Vercel → Environment Variables. Allow network access from anywhere (0.0.0.0/0) in Atlas if you use IP allowlists.",
    };
  }

  return { ok: true, uri };
}

module.exports = { resolveMongoUri };
