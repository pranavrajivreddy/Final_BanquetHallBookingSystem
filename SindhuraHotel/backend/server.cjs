require("dotenv").config(); // MUST be first

const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const db = require("./db.cjs");

console.log("DATABASE_URL exists:", !!process.env.DATABASE_URL);
console.log("JWT_SECRET exists:", !!process.env.JWT_SECRET);

const app = express();
const PORT = process.env.PORT || 3001;
const distPath = path.resolve(__dirname, "../dist");
const hasFrontendBuild = fs.existsSync(distPath);
const normalizeOrigin = (origin = "") => origin.trim().replace(/\/+$/, "");

const allowedOrigins = new Set([
  "http://localhost:5173",
  "http://127.0.0.1:5173"
].map(normalizeOrigin));

const addOriginsFromEnv = (value) => {
  if (!value) {
    return;
  }

  value
    .split(",")
    .map(normalizeOrigin)
    .filter(Boolean)
    .forEach((origin) => allowedOrigins.add(origin));
};

addOriginsFromEnv(process.env.FRONTEND_URL);
addOriginsFromEnv(process.env.FRONTEND_URLS);

console.log("Allowed CORS origins:", Array.from(allowedOrigins));

app.use(cors({
  origin(origin, callback) {
    const normalizedOrigin = origin ? normalizeOrigin(origin) : origin;

    if (!normalizedOrigin || allowedOrigins.has(normalizedOrigin)) {
      return callback(null, true);
    }

    console.error("Rejected CORS origin:", origin);
    return callback(new Error("CORS not allowed"));
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"]
}));
app.use(express.json());
app.use("/api", require("./routes/authRoutes.cjs"));
app.use("/api", require("./routes/adminRequestRoutes.cjs"));
app.use("/", require("./routes/bookingRoutes.cjs"));

app.get("/", (_req, res) => {
  if (hasFrontendBuild) {
    return res.sendFile(path.join(distPath, "index.html"));
  }

  return res.json({ message: "Backend is working" });
});

if (hasFrontendBuild) {
  app.use(express.static(distPath));

  app.get(/^(?!\/(?:api|bookings|admin)\b).*/, (_req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });
}

app.use((req, res) => {
  res.status(404).json({
    message: `Route ${req.method} ${req.originalUrl} not found`
  });
});

app.use((error, _req, res, _next) => {
  console.error("Unhandled server error:", error);

  if (error.message === "CORS not allowed") {
    return res.status(403).json({ message: "Origin not allowed by CORS" });
  }

  return res.status(500).json({ message: "Internal server error" });
});

const startServer = async () => {
  try {
    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is required");
    }

    await db.ensureDatabaseSchema();
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
