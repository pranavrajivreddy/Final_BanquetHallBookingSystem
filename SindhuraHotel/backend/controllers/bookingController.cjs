const db = require("../db.cjs");

const allowedStatuses = new Set(["Pending", "Approved", "Rejected"]);

const normalizeBooking = (booking) => ({
  ...booking,
  guests: Number(booking.guests)
});

const createBooking = async (req, res) => {
  const {
    name = "",
    date = "",
    eventType = "",
    decoration = "",
    food = "",
    guests,
    requests = ""
  } = req.body;

  if (!name.trim() || !date || !eventType.trim() || !guests) {
    return res.status(400).json({
      message: "Name, date, event type, and number of guests are required"
    });
  }

  try {
    const result = await db.query(
      `INSERT INTO bookings
        (user_id, name, date, eventtype, decoration, food, guests, requests, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'Pending')
       RETURNING id, user_id, name, date, eventtype AS "eventType", decoration, food, guests, requests, status`,
      [
        req.user.id,
        name.trim(),
        date,
        eventType.trim(),
        decoration.trim(),
        food.trim(),
        Number(guests),
        requests.trim()
      ]
    );

    return res.status(201).json({
      message: "Booking created successfully",
      booking: normalizeBooking(result.rows[0])
    });
  } catch (error) {
    console.error("Create booking error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

const getUserBookings = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT id, user_id, name, date, eventtype AS "eventType", decoration, food, guests, requests, status
       FROM bookings
       WHERE user_id = $1
       ORDER BY date DESC, id DESC`,
      [req.user.id]
    );

    return res.json({ bookings: result.rows.map(normalizeBooking) });
  } catch (error) {
    console.error("Fetch user bookings error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

const getAdminBookings = async (_req, res) => {
  try {
    const result = await db.query(
      `SELECT
         bookings.id,
         bookings.user_id,
         bookings.name,
         bookings.date,
         bookings.eventtype AS "eventType",
         bookings.decoration,
         bookings.food,
         bookings.guests,
         bookings.requests,
         bookings.status,
         users.mobile
       FROM bookings
       INNER JOIN users ON bookings.user_id = users.id
       ORDER BY bookings.date DESC, bookings.id DESC`
    );

    return res.json({ bookings: result.rows.map(normalizeBooking) });
  } catch (error) {
    console.error("Fetch admin bookings error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

const updateBookingStatus = async (req, res) => {
  const { status } = req.body;
  const bookingId = Number(req.params.id);

  if (!bookingId) {
    return res.status(400).json({ message: "Valid booking id is required" });
  }

  if (!allowedStatuses.has(status) || status === "Pending") {
    return res.status(400).json({ message: "Status must be Approved or Rejected" });
  }

  try {
    const result = await db.query(
      "UPDATE bookings SET status = $1 WHERE id = $2",
      [status, bookingId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Booking not found" });
    }

    return res.json({ message: "Booking status updated successfully" });
  } catch (error) {
    console.error("Update booking status error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  createBooking,
  getUserBookings,
  getAdminBookings,
  updateBookingStatus
};
