require("dotenv").config(); // MUST be first

const express = require("express");
const cors = require("cors");
const db = require("./db.cjs");

const DATABASE_URL = process.env.DATABASE_URL;
const JWT_SECRET = process.env.JWT_SECRET;
console.log("DATABASE_URL exists:", !!process.env.DATABASE_URL);
console.log("JWT_SECRET exists:", !!process.env.JWT_SECRET);
const app = express();
const PORT = process.env.PORT || 3001;

const allowedOrigins = new Set([
  "http://localhost:5173",
  "http://127.0.0.1:5173"
]);

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.has(origin)) {
      return callback(null, true);
    }

    return callback(new Error("CORS not allowed"));
  }
}));
app.use(express.json());
app.use("/api", require("./routes/authRoutes.cjs"));
app.use("/api", require("./routes/adminRequestRoutes.cjs"));
app.use("/", require("./routes/bookingRoutes.cjs"));

app.get("/", (_req, res) => {
  res.json({ message: "Backend is working" });
});

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
