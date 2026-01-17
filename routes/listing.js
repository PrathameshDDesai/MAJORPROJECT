const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync");
const Listing = require("../models/listing");
const upload = require("../middleware/upload");
const ExpressError = require("../utils/ExpressError");





/* ---------- INDEX: Display all listings ---------- */
router.get("/", wrapAsync(async (req, res) => {
    const allListings = await Listing.find({}).sort({ createdAt: -1 }); // Get all listings, newest first
    res.render("listings/index", { allListings });
}));

/* ---------- NEW FORM: Render form to create listing ---------- */
router.get("/new", (req, res) => {
    res.render("listings/new");
});

/* ---------- CREATE: Save new listing to database ---------- */
router.post("/", upload.single("imageFile"), wrapAsync(async (req, res) => {
    const listingData = req.body.listing;

    // Handle image upload from file or URL
    if (req.file) {
        listingData.image = `/uploads/${req.file.filename}`;
    } else if (!listingData.image || listingData.image.trim() === "") {
        listingData.image = "/images/default.jpeg"; // Fallback image
    }

    const newListing = new Listing(listingData);
    await newListing.save();

    // Set flash message and redirect
    req.flash("success", "New Listing Created!");
    res.redirect("/listings");
}));

/* ---------- SHOW: Display details of a specific listing ---------- */
router.get("/:id", wrapAsync(async (req, res) => {
    const { id } = req.params;
    // Populate reviews to show them on the page
    const listing = await Listing.findById(id).populate("reviews");

    if (!listing) {
        req.flash("error", "The listing you are looking for does not exist!");
        return res.redirect("/listings");
    }
    res.render("listings/show", { listing });
}));

/* ---------- EDIT FORM: Render form to edit listing ---------- */
router.get("/:id/edit", wrapAsync(async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);

    if (!listing) {
        req.flash("error", "The listing you want to edit does not exist!");
        return res.redirect("/listings");
    }
    res.render("listings/edit", { listing });
}));

/* ---------- UPDATE: Save changes to a listing ---------- */
router.patch("/:id", upload.single("imageFile"), wrapAsync(async (req, res) => {
    const { id } = req.params;
    const listingData = req.body.listing;

    // Update image if a new file is uploaded
    if (req.file) {
        listingData.image = `/uploads/${req.file.filename}`;
    }

    await Listing.findByIdAndUpdate(id, { ...listingData });
    req.flash("success", "Listing updated successfully!");
    res.redirect(`/listings/${id}`);
}));

/* ---------- DELETE: Remove a listing from database ---------- */
router.delete("/:id", wrapAsync(async (req, res) => {
    const { id } = req.params;
    await Listing.findByIdAndDelete(id); // Post-delete middleware handles review cleanup
    req.flash("success", "Listing deleted!");
    res.redirect("/listings");
}));

module.exports = router;
