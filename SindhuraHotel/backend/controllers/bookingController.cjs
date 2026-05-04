const { db } = require("../db.cjs");

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
    const [result] = await db.execute(
      `INSERT INTO bookings
        (user_id, name, date, eventType, decoration, food, guests, requests, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Pending')`,
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
      booking: {
        id: result.insertId,
        user_id: req.user.id,
        name: name.trim(),
        date,
        eventType: eventType.trim(),
        decoration: decoration.trim(),
        food: food.trim(),
        guests: Number(guests),
        requests: requests.trim(),
        status: "Pending"
      }
    });
  } catch (error) {
    console.error("Create booking error:", error);
    return res.status(500).json({ message: "Unable to create booking" });
  }
};

const getUserBookings = async (req, res) => {
  try {
    const [rows] = await db.execute(
      `SELECT id, user_id, name, date, eventType, decoration, food, guests, requests, status
       FROM bookings
       WHERE user_id = ?
       ORDER BY date DESC, id DESC`,
      [req.user.id]
    );

    return res.json({ bookings: rows.map(normalizeBooking) });
  } catch (error) {
    console.error("Fetch user bookings error:", error);
    return res.status(500).json({ message: "Unable to fetch bookings" });
  }
};

const getAdminBookings = async (_req, res) => {
  try {
    const [rows] = await db.execute(
      `SELECT
         bookings.id,
         bookings.user_id,
         bookings.name,
         bookings.date,
         bookings.eventType,
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

    return res.json({ bookings: rows.map(normalizeBooking) });
  } catch (error) {
    console.error("Fetch admin bookings error:", error);
    return res.status(500).json({ message: "Unable to fetch admin bookings" });
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
    const [result] = await db.execute(
      "UPDATE bookings SET status = ? WHERE id = ?",
      [status, bookingId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Booking not found" });
    }

    return res.json({ message: "Booking status updated successfully" });
  } catch (error) {
    console.error("Update booking status error:", error);
    return res.status(500).json({ message: "Unable to update booking status" });
  }
};

module.exports = {
  createBooking,
  getUserBookings,
  getAdminBookings,
  updateBookingStatus
};
