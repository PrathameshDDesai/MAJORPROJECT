const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync");
const Listing = require("../models/listing");
const upload = require("../middleware/upload");
const { } = require("../middleware.js");

/* ---------- INDEX: Display all listings ---------- */
router.get("/", wrapAsync(async (req, res) => {
    const allListings = await Listing.find({}).sort({ createdAt: -1 }); // Get all listings, newest first
    res.render("listings/index", { allListings });
}));

/* ---------- NEW FORM: Render form to create listing ---------- */
router.get("/new", (req, res) => {
    if (!req.isAuthenticated()) {
        req.flash("error", "you must be logged in to cerate listing!");
        return res.redirect("/login");
    }
    res.render("listings/new");
});

/* ---------- CREATE: Save new listing to database ---------- */
router.post("/", upload.array("imageFiles", 5), wrapAsync(async (req, res) => {
    const listingData = req.body.listing;
    listingData.images = [];



    // Handle multiple uploaded files
    if (req.files && req.files.length > 0) {
        req.files.forEach(file => {
            listingData.images.push(`/uploads/${file.filename}`);
        });
    }

    // Handle multiple image URLs if provided (as an array or single string from form)
    if (req.body.imageUrls) {
        const urls = Array.isArray(req.body.imageUrls) ? req.body.imageUrls : [req.body.imageUrls];
        urls.forEach(url => {
            if (url && url.trim() !== "") {
                listingData.images.push(url.trim());
            }
        });
    }

    // Fallback if no images provided at all
    if (listingData.images.length === 0) {
        listingData.images = ["/images/default.jpeg"];
    }

    const newListing = new Listing(listingData);
    await newListing.save();

    // Set flash message and redirect
    req.flash("success", "New Listing Created with multiple images!");
    res.redirect("/listings");
}));

/* ---------- SHOW: Display details of a specific listing ---------- */
router.get("/:id", wrapAsync(async (req, res) => {
    const { id } = req.params;
    // Populate reviews and their authors, and the listing owner
    const listing = await Listing.findById(id)
        .populate("reviews");

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
router.patch("/:id", upload.array("imageFiles", 5), wrapAsync(async (req, res) => {
    const { id } = req.params;
    const listingData = req.body.listing;

    // Find existing listing to manage images
    const listing = await Listing.findById(id);
    if (!listing) {
        req.flash("error", "Listing not found!");
        return res.redirect("/listings");
    }

    // Initialize with existing images
    let updatedImages = listing.images || [];

    // 1. Handle image deletions (if any checkboxes were checked in edit form)
    if (req.body.deleteImages) {
        const toDelete = Array.isArray(req.body.deleteImages) ? req.body.deleteImages : [req.body.deleteImages];
        updatedImages = updatedImages.filter(img => !toDelete.includes(img));
    }

    // 2. Add new uploaded files
    if (req.files && req.files.length > 0) {
        req.files.forEach(file => {
            updatedImages.push(`/uploads/${file.filename}`);
        });
    }

    // 3. Add new URLs from the form
    if (req.body.imageUrls) {
        const urls = Array.isArray(req.body.imageUrls) ? req.body.imageUrls : [req.body.imageUrls];
        urls.forEach(url => {
            if (url && url.trim() !== "") {
                updatedImages.push(url.trim());
            }
        });
    }

    // 4. Fallback if user deleted everything
    if (updatedImages.length === 0) {
        updatedImages = ["/images/default.jpeg"];
    }

    listingData.images = updatedImages;



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
