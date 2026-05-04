const express = require("express");

const {
  requestAdminAccess,
  getPendingAdminRequests,
  approveAdminRequest,
  rejectAdminRequest
} = require("../controllers/adminRequestController.cjs");
const { verifyToken, requireRole } = require("../middleware/authMiddleware.cjs");

const router = express.Router();

router.post("/admin/request", requestAdminAccess);
router.get("/admin/pending", verifyToken, requireRole("superadmin"), getPendingAdminRequests);
router.post("/admin/approve/:id", verifyToken, requireRole("superadmin"), approveAdminRequest);
router.delete("/admin/:id", verifyToken, requireRole("superadmin"), rejectAdminRequest);

module.exports = router;
