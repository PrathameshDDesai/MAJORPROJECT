const express = require("express");
const router = express.Router();
const User = require("../models/user");
const wrapAsync = require("../utils/wrapAsync");
const passport = require("passport");
const { saveRedirectUrl } = require("../middleware");

// ==================== SIGNUP ROUTES ====================

// GET /signup - Render signup form
router.get("/signup", (req, res) => {
    res.render("users/signup");
});

// POST /signup - Handle user registration
router.post("/signup", wrapAsync(async (req, res, next) => {
    try {
        const { username, email, password, fullname, role, phoneNumber, address } = req.body;
        const newUser = new User({ email, username, fullname, role, phoneNumber, address });
        const registeredUser = await User.register(newUser, password);

        // Log the user in after successful registration
        req.login(registeredUser, (err) => {
            if (err) return next(err);
            req.flash("success", `Welcome to UniRooms, ${registeredUser.fullname}!`);
            return res.redirect("/listings");
        });
    } catch (e) {
        req.flash("error", e.message);
        res.redirect("/signup");
    }
}));

// ==================== LOGIN ROUTES ====================

// GET /login - Render login form
router.get("/login", saveRedirectUrl, (req, res) => {
    res.render("users/login");
});

// POST /login - Handle user authentication
router.post("/login",
    passport.authenticate("local", {
        failureFlash: true,
        failureRedirect: "/login"
    }),
    (req, res) => {
        req.flash("success", `Welcome back, ${req.user.fullname}!`);
        const redirectUrl = res.locals.returnTo || "/listings";
        delete req.session.returnTo;
        res.redirect(redirectUrl);
    }
);

// ==================== LOGOUT ROUTE ====================

// GET /logout - Handle user logout
router.get("/logout", (req, res, next) => {
    req.logout((err) => {
        if (err) return next(err);
        req.flash("success", "You have been logged out successfully!");
        res.redirect("/listings");
    });
});

module.exports = router;