const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../db.cjs");

const SECRET = process.env.JWT_SECRET || "supersecret";

const normalizeMobile = (mobile = "") => mobile.trim();

const register = async (req, res) => {
  const mobile = normalizeMobile(req.body.mobile);
  const password = req.body.password || "";

  if (!mobile || !password) {
    return res.status(400).json({ message: "Mobile number and password are required" });
  }

  if (password.length < 6) {
    return res.status(400).json({ message: "Password must be at least 6 characters" });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    await db.query(
      "INSERT INTO users (mobile, password, role) VALUES ($1, $2, 'customer')",
      [mobile, hashedPassword]
    );

    return res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    console.error("Register error:", err);

    if (err.code === "23505") {
      return res.status(409).json({ message: "User already exists" });
    }

    return res.status(500).json({ message: "Server error" });
  }
};

const login = async (req, res) => {
  const mobile = normalizeMobile(req.body.mobile);
  const password = req.body.password || "";

  if (!mobile || !password) {
    return res.status(400).json({ message: "Mobile number and password are required" });
  }

  try {
    const result = await db.query(
      "SELECT id, mobile, password, role FROM users WHERE mobile = $1 LIMIT 1",
      [mobile]
    );
    const rows = result.rows;

    if (rows.length === 0) {
      return res.status(401).json({ message: "Invalid mobile number or password" });
    }

    const user = rows[0];
    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.status(401).json({ message: "Invalid mobile number or password" });
    }

    const token = jwt.sign({ id: user.id, role: user.role }, SECRET, { expiresIn: "7d" });

    return res.json({
      message: "Login successful",
      token,
      role: user.role,
      userId: user.id
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  register,
  login
};
