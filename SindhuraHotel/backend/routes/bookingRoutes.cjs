const express = require("express");

const {
  createBooking,
  getUserBookings,
  getAdminBookings,
  updateBookingStatus
} = require("../controllers/bookingController.cjs");
const { verifyToken, requireRole } = require("../middleware/authMiddleware.cjs");

const router = express.Router();

router.post("/bookings", verifyToken, createBooking);
router.get("/bookings", verifyToken, getUserBookings);
router.get("/admin/bookings", verifyToken, requireRole("admin"), getAdminBookings);
router.patch("/bookings/:id", verifyToken, requireRole("admin"), updateBookingStatus);

module.exports = router;
