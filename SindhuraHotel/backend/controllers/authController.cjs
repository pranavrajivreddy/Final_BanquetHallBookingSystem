const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { db } = require("../db.cjs");

const SECRET = process.env.JWT_SECRET || "supersecret";

const normalizeMobile = (mobile = "") => mobile.trim();

const hasUsersStatusColumn = async () => {
  const [rows] = await db.execute("SHOW COLUMNS FROM users LIKE 'status'");
  return rows.length > 0;
};

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

    if (await hasUsersStatusColumn()) {
      await db.execute(
        "INSERT INTO users (mobile, password, role, status) VALUES (?, ?, 'customer', 'approved')",
        [mobile, hashedPassword]
      );
    } else {
      await db.execute(
        "INSERT INTO users (mobile, password, role) VALUES (?, ?, 'customer')",
        [mobile, hashedPassword]
      );
    }

    return res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    console.error("Register error:", err);

    if (err.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ message: "User already exists" });
    }

    return res.status(500).json({ message: "Unable to register user" });
  }
};

const login = async (req, res) => {
  const mobile = normalizeMobile(req.body.mobile);
  const password = req.body.password || "";

  if (!mobile || !password) {
    return res.status(400).json({ message: "Mobile number and password are required" });
  }

  try {
    const [rows] = await db.execute(
      "SELECT id, mobile, password, role FROM users WHERE mobile = ? LIMIT 1",
      [mobile]
    );

    if (rows.length === 0) {
      return res.status(401).json({ message: "Invalid mobile number or password" });
    }

    const user = rows[0];
    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.status(401).json({ message: "Invalid mobile number or password" });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      SECRET,
      { expiresIn: "7d" }
    );

    return res.json({
      message: "Login successful",
      token,
      role: user.role,
      userId: user.id
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ message: "Unable to login" });
  }
};

module.exports = {
  register,
  login
};
