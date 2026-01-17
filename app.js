const express = require("express");
const ejsMate = require('ejs-mate');
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const Review = require("./models/review");
const Listing = require("./models/listing");
const wrapAsync = require("./utils/wrapAsync");
const ExpressError = require("./utils/ExpressError");
const reviews = require("./routes/review.js");
const listings = require("./routes/listing.js");
const app = express();

/* ================= DATABASE ================= */
mongoose.connect("mongodb://127.0.0.1:27017/UniRooms")
    .then(() => console.log("MongoDB connected"))
    .catch(err => console.error(err));

/* ================= VIEW ENGINE ================= */
app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

/* ================= MIDDLEWARE ================= */
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));

// Static files
app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
// Active navbar link middleware
app.use((req, res, next) => {
    res.locals.currentPath = req.path;
    next();
});

/* ================= ROUTES ================= */

app.get("/", (req, res) => {
    res.redirect("/listings");
});

app.use("/listings", listings);
app.use("/listings/:id/reviews", reviews);



/* ================= SERVER ================= */
app.listen(8080, () => {
    console.log("Server running at http://localhost:8080");
});

/* ================= ERROR HANDLING ================= */

// 404 handler
app.use((req, res, next) => {
    next(new ExpressError("Page not found", 404));
});

// Global error handler
app.use((err, req, res, next) => {
    const { statusCode = 500, message = "Something went wrong" } = err;
    res.status(statusCode).render("listings/error", { message });
});