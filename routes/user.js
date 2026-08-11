const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync");
const passport = require("passport");
const { saveRedirectUrl, isLoggedIn, isAdmin } = require("../middleware");
const userController = require("../controllers/users");

// ==================== SIGNUP ROUTES ====================

router.route("/signup")
    .get(userController.renderSignupForm)
    .post(wrapAsync(userController.signup));

// ==================== LOGIN ROUTES ====================

router.route("/login")
    .get(saveRedirectUrl, userController.renderLoginForm)
    .post(
        passport.authenticate("local", {
            failureFlash: true,
            failureRedirect: "/login"
        }),
        userController.login
    );


// ==================== LOGOUT ROUTE ====================

// GET /logout - Handle user logout
router.get("/logout", userController.logout);

// ==================== WISHLIST ROUTE ====================
router.get("/wishlist", isLoggedIn, wrapAsync(userController.renderWishlist));

// ==================== DASHBOARD ROUTE ====================
router.get("/dashboard", isLoggedIn, wrapAsync(userController.renderDashboard));

// ==================== ADMIN USER MANAGEMENT ====================
router.delete("/admin/users/:id", isLoggedIn, isAdmin, wrapAsync(userController.deleteUser));

module.exports = router;

