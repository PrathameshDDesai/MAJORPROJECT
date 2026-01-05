const express = require("express");
const ejsMate = require('ejs-mate');
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const wrapAsync = require("./utils/wrapAsync");
const Listing = require("./models/listing");
const upload = require("./middleware/upload");
const ExpressError = require("./utils/ExpressError");
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

// HOME → listings
app.get("/", (req, res) => {
    res.redirect("/listings");
});

/* ---------- INDEX ---------- */
app.get("/listings", async (req, res) => {
    try {
        const allListings = await Listing.find({});
        res.render("listings/index", { allListings });
    } catch (err) {
        console.error(err);
        res.status(500).send("Failed to load listings");
    }
});

/* ---------- NEW FORM ---------- */
app.get("/listings/new", (req, res) => {
    res.render("listings/new");
});

/* ---------- CREATE ---------- */
app.post("/listings", upload.single("imageFile"), wrapAsync(async (req, res, next) => {

    const listingData = req.body.listing;

    // IMAGE LOGIC (NO DELAY, NO BREAK)
    if (req.file) {
        listingData.image = `/uploads/${req.file.filename}`;
    } else if (!listingData.image) {
        listingData.image = "/images/default.jpg";
    }

    await Listing.create(listingData);
    res.redirect("/listings");

})
);

/* ---------- SHOW ---------- */
app.get("/listings/:id", async (req, res) => {
    try {
        const listing = await Listing.findById(req.params.id);
        if (!listing) return res.status(404).send("Listing not found");

        res.render("listings/show", { listing });
    } catch (err) {
        console.error(err);
        res.status(500).send("Error loading listing");
    }
});

/* ---------- EDIT FORM ---------- */
app.get("/listings/:id/edit", async (req, res) => {
    try {
        const listing = await Listing.findById(req.params.id);
        if (!listing) return res.status(404).send("Listing not found");

        res.render("listings/edit", { listing });
    } catch (err) {
        console.error(err);
        res.status(500).send("Error loading edit page");
    }
});

/* ---------- UPDATE ---------- */
app.patch("/listings/:id", upload.single("imageFile"), async (req, res) => {
    try {
        const listingData = req.body.listing;

        if (req.file) {
            listingData.image = `/uploads/${req.file.filename}`;
        }

        await Listing.findByIdAndUpdate(req.params.id, listingData, {
            runValidators: true,
            new: true
        });

        res.redirect(`/listings/${req.params.id}`);
    } catch (err) {
        console.error(err);
        res.status(500).send("Failed to update listing");
    }
});

/* ---------- DELETE ---------- */
app.delete("/listings/:id", async (req, res) => {
    try {
        await Listing.findByIdAndDelete(req.params.id);
        res.redirect("/listings");
    } catch (err) {
        console.error(err);
        res.status(500).send("Failed to delete listing");
    }
});

/* ================= SERVER ================= */
app.listen(8080, () => {
    console.log("Server running at http://localhost:8080");
});

/* ================= ERROR HANDLING ================= */

// 404 handler
app.use((req, res, next) => {
    next(new ExpressError(404, "Page not found"));
});

// Global error handler
app.use((err, req, res, next) => {
    const { statusCode = 500, message = "Something went wrong" } = err;
    res.status(statusCode).send(message);
});
