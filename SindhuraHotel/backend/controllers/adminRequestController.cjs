const bcrypt = require("bcrypt");
const db = require("../db.cjs");

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
    const existingUsersResult = await db.query(
      "SELECT id FROM users WHERE mobile = $1 LIMIT 1",
      [mobile.trim()]
    );

    if (existingUsersResult.rows.length > 0) {
      return res.status(409).json({
        message: "An account with this mobile number already exists"
      });
    }

    const existingRequestsResult = await db.query(
      "SELECT id, status FROM admin_requests WHERE mobile = $1 LIMIT 1",
      [mobile.trim()]
    );

    if (existingRequestsResult.rows.length > 0) {
      const existingRequest = existingRequestsResult.rows[0];

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

    await db.query(
      `INSERT INTO admin_requests (name, mobile, password, status)
       VALUES ($1, $2, $3, 'Pending')`,
      [name.trim(), mobile.trim(), hashedPassword]
    );

    return res.status(201).json({
      message: "Admin request submitted successfully. Please wait for super admin approval."
    });
  } catch (error) {
    console.error("Admin request error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

const getPendingAdminRequests = async (_req, res) => {
  try {
    const result = await db.query(
      `SELECT id, name, mobile, status, created_at
       FROM admin_requests
       WHERE status = 'Pending'
       ORDER BY created_at DESC, id DESC`
    );

    return res.json({ requests: result.rows });
  } catch (error) {
    console.error("Fetch admin requests error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

const approveAdminRequest = async (req, res) => {
  const requestId = Number(req.params.id);

  if (!requestId) {
    return res.status(400).json({ message: "Valid request id is required" });
  }

  const client = await db.connect();

  try {
    await client.query("BEGIN");

    const requestResult = await client.query(
      `SELECT id, name, mobile, password, status
       FROM admin_requests
       WHERE id = $1
       FOR UPDATE`,
      [requestId]
    );

    if (requestResult.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ message: "Admin request not found" });
    }

    const adminRequest = requestResult.rows[0];

    if (adminRequest.status !== "Pending") {
      await client.query("ROLLBACK");
      return res.status(400).json({ message: "This request has already been processed" });
    }

    const existingUsersResult = await client.query(
      "SELECT id FROM users WHERE mobile = $1 LIMIT 1",
      [adminRequest.mobile]
    );

    if (existingUsersResult.rows.length > 0) {
      await client.query(
        "UPDATE admin_requests SET status = 'Rejected' WHERE id = $1",
        [requestId]
      );
      await client.query("COMMIT");
      return res.status(409).json({
        message: "A user with this mobile number already exists"
      });
    }

    await client.query(
      "INSERT INTO users (mobile, password, role) VALUES ($1, $2, 'admin')",
      [adminRequest.mobile, adminRequest.password]
    );

    await client.query(
      "UPDATE admin_requests SET status = 'Approved' WHERE id = $1",
      [requestId]
    );

    await client.query("COMMIT");

    return res.json({ message: "Admin request approved successfully" });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Approve admin request error:", error);
    return res.status(500).json({ message: "Server error" });
  } finally {
    client.release();
  }
};

const rejectAdminRequest = async (req, res) => {
  const requestId = Number(req.params.id);

  if (!requestId) {
    return res.status(400).json({ message: "Valid request id is required" });
  }

  try {
    const result = await db.query(
      "DELETE FROM admin_requests WHERE id = $1",
      [requestId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Admin request not found" });
    }

    return res.json({ message: "Admin request deleted successfully" });
  } catch (error) {
    console.error("Delete admin request error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  requestAdminAccess,
  getPendingAdminRequests,
  approveAdminRequest,
  rejectAdminRequest
};
