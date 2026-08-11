const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync");
const { isLoggedIn, isAdmin } = require("../middleware");
const verificationController = require("../controllers/verifications");

// Owner verification request form & submission
router.route("/users/verify")
    .get(isLoggedIn, wrapAsync(verificationController.renderForm))
    .post(isLoggedIn, wrapAsync(verificationController.submitForm));

// Admin dashboard for verifications review
router.get("/admin/verifications", isAdmin, wrapAsync(verificationController.adminIndex));
router.post("/admin/verifications/:id/approve", isAdmin, wrapAsync(verificationController.approve));
router.post("/admin/verifications/:id/reject", isAdmin, wrapAsync(verificationController.reject));

module.exports = router;
