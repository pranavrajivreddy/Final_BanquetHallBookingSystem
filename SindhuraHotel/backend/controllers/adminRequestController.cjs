const bcrypt = require("bcrypt");
const { db } = require("../db.cjs");

const hasUsersStatusColumn = async () => {
  const [rows] = await db.execute("SHOW COLUMNS FROM users LIKE 'status'");
  return rows.length > 0;
};

const requestAdminAccess = async (req, res) => {
  const { name = "", mobile = "", password = "" } = req.body;

  if (!name.trim() || !mobile.trim() || !password) {
    return res.status(400).json({
      message: "Name, mobile number, and password are required"
    });
  }

  if (password.length < 6) {
    return res.status(400).json({
      message: "Password must be at least 6 characters"
    });
  }

  try {
    const [existingUsers] = await db.execute(
      "SELECT id FROM users WHERE mobile = ? LIMIT 1",
      [mobile.trim()]
    );

    if (existingUsers.length > 0) {
      return res.status(409).json({
        message: "An account with this mobile number already exists"
      });
    }

    const [existingRequests] = await db.execute(
      "SELECT id, status FROM admin_requests WHERE mobile = ? LIMIT 1",
      [mobile.trim()]
    );

    if (existingRequests.length > 0) {
      const existingRequest = existingRequests[0];

      if (existingRequest.status === "Pending") {
        return res.status(409).json({
          message: "An admin request is already pending for this mobile number"
        });
      }

      return res.status(409).json({
        message: "This admin request has already been processed"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await db.execute(
      `INSERT INTO admin_requests (name, mobile, password, status)
       VALUES (?, ?, ?, 'Pending')`,
      [name.trim(), mobile.trim(), hashedPassword]
    );

    return res.status(201).json({
      message: "Admin request submitted successfully. Please wait for super admin approval."
    });
  } catch (error) {
    console.error("Admin request error:", error);
    return res.status(500).json({ message: "Unable to submit admin request" });
  }
};

const getPendingAdminRequests = async (_req, res) => {
  try {
    const [rows] = await db.execute(
      `SELECT id, name, mobile, status, created_at
       FROM admin_requests
       WHERE status = 'Pending'
       ORDER BY created_at DESC, id DESC`
    );

    return res.json({ requests: rows });
  } catch (error) {
    console.error("Fetch admin requests error:", error);
    return res.status(500).json({ message: "Unable to fetch admin requests" });
  }
};

const approveAdminRequest = async (req, res) => {
  const requestId = Number(req.params.id);

  if (!requestId) {
    return res.status(400).json({ message: "Valid request id is required" });
  }

  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const [requestRows] = await connection.execute(
      `SELECT id, name, mobile, password, status
       FROM admin_requests
       WHERE id = ? FOR UPDATE`,
      [requestId]
    );

    if (requestRows.length === 0) {
      await connection.rollback();
      return res.status(404).json({ message: "Admin request not found" });
    }

    const adminRequest = requestRows[0];

    if (adminRequest.status !== "Pending") {
      await connection.rollback();
      return res.status(400).json({ message: "This request has already been processed" });
    }

    const [existingUsers] = await connection.execute(
      "SELECT id FROM users WHERE mobile = ? LIMIT 1",
      [adminRequest.mobile]
    );

    if (existingUsers.length > 0) {
      await connection.execute(
        "UPDATE admin_requests SET status = 'Rejected' WHERE id = ?",
        [requestId]
      );
      await connection.commit();
      return res.status(409).json({
        message: "A user with this mobile number already exists"
      });
    }

    if (await hasUsersStatusColumn()) {
      await connection.execute(
        `INSERT INTO users (mobile, password, role, status)
         VALUES (?, ?, 'admin', 'approved')`,
        [adminRequest.mobile, adminRequest.password]
      );
    } else {
      await connection.execute(
        `INSERT INTO users (mobile, password, role)
         VALUES (?, ?, 'admin')`,
        [adminRequest.mobile, adminRequest.password]
      );
    }

    await connection.execute(
      "UPDATE admin_requests SET status = 'Approved' WHERE id = ?",
      [requestId]
    );

    await connection.commit();

    return res.json({ message: "Admin request approved successfully" });
  } catch (error) {
    await connection.rollback();
    console.error("Approve admin request error:", error);
    return res.status(500).json({ message: "Unable to approve admin request" });
  } finally {
    connection.release();
  }
};

const rejectAdminRequest = async (req, res) => {
  const requestId = Number(req.params.id);

  if (!requestId) {
    return res.status(400).json({ message: "Valid request id is required" });
  }

  try {
    const [result] = await db.execute(
      "DELETE FROM admin_requests WHERE id = ?",
      [requestId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Admin request not found" });
    }

    return res.json({ message: "Admin request deleted successfully" });
  } catch (error) {
    console.error("Delete admin request error:", error);
    return res.status(500).json({ message: "Unable to delete admin request" });
  }
};

module.exports = {
  requestAdminAccess,
  getPendingAdminRequests,
  approveAdminRequest,
  rejectAdminRequest
};
