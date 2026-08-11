const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync");
const { isLoggedIn } = require("../middleware");
const bookingController = require("../controllers/bookings");

// Create booking / request visit
router.post("/bookings", isLoggedIn, wrapAsync(bookingController.create));

// Owner action on visit request
router.post("/bookings/:id/status", isLoggedIn, wrapAsync(bookingController.updateStatus));

module.exports = router;
