if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}

const express = require("express");
const ejsMate = require('ejs-mate');
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const expressSession = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");

// Models
const Review = require("./models/review");
const Listing = require("./models/listing");
const User = require("./models/user");
// Utilities & Error Handling
const wrapAsync = require("./utils/wrapAsync");
const ExpressError = require("./utils/ExpressError");

// Route Handlers
const reviews = require("./routes/review.js");
const listings = require("./routes/listing.js");
const user = require("./routes/user.js");
const app = express();

/* ================= DATABASE CONNECTION ================= */
const MONGO_URL = "mongodb://127.0.0.1:27017/UniRooms";
mongoose.connect(MONGO_URL)
    .then(() => console.log("Connected to MongoDB"))
    .catch(err => console.error("MongoDB Connection Error:", err));

/* ================= VIEW ENGINE SETUP ================= */
app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));


/* ================= MIDDLEWARE ================= */
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies
app.use(methodOverride("_method")); // Allow PUT/PATCH/DELETE via _method query param

// Static files configuration
app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

/* ================= Express Section (Sessions & Flash) ================= */
const sessionOption = {
    secret: "MySupperSecretCode",
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days from now
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true
    }
};
app.use(expressSession(sessionOption));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Global locals middleware (Available in all EJS templates)
app.use((req, res, next) => {
    res.locals.success = req.flash("success"); // Success notifications
    res.locals.error = req.flash("error");     // Error notifications
    res.locals.currentPath = req.path;         // Useful for highlighting active navbar links
    res.locals.currUser = req.user;
    next();
});



/* ================= ROUTE HANDLERS ================= */

// Root Route: Redirect to listings index
app.get("/", (req, res) => {
    res.redirect("/listings");
});

// Resource Routes
app.use("/listings", listings);
app.use("/listings/:id/reviews", reviews);
app.use("/", user);
/* ================= ERROR HANDLING ================= */

// 404 Route Handler - matches anything that wasn't caught by the above routes
app.use((req, res, next) => {
    next(new ExpressError("Page Not Found", 404));
});

// Global Error Handler Middleware
app.use((err, req, res, next) => {
    const { statusCode = 500, message = "Something went wrong" } = err;
    res.status(statusCode).render("listings/error", { message });
});

/* ================= SERVER INITIALIZATION ================= */
const PORT = 8080;
app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
