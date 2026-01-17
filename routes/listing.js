const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync");
const Listing = require("../models/listing");
const upload = require("../middleware/upload");
const ExpressError = require("../utils/ExpressError");





/* ---------- INDEX ---------- */
router.get("/", wrapAsync(async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index", { allListings });
}));

/* ---------- NEW FORM ---------- */
router.get("/new", (req, res) => {
    res.render("listings/new");
});

/* ---------- CREATE ---------- */
router.post("/", upload.single("imageFile"), wrapAsync(async (req, res) => {
    const listingData = req.body.listing;
    if (req.file) {
        listingData.image = `/uploads/${req.file.filename}`;
    } else if (!listingData.image) {
        listingData.image = "/images/default.jpg";
    }
    const newListing = new Listing(listingData);
    await newListing.save();
    res.redirect("/listings");
}));

/* ---------- SHOW ---------- */
router.get("/:id", wrapAsync(async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id).populate("reviews");
    if (!listing) {
        return res.status(404).send("Listing not found");
    }
    res.render("listings/show", { listing });
}));

/* ---------- EDIT FORM ---------- */
router.get("/:id/edit", wrapAsync(async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
        return res.status(404).send("Listing not found");
    }
    res.render("listings/edit", { listing });
}));

/* ---------- UPDATE ---------- */
router.patch("/:id", upload.single("imageFile"), wrapAsync(async (req, res) => {
    const { id } = req.params;
    const listingData = req.body.listing;
    if (req.file) {
        listingData.image = `/uploads/${req.file.filename}`;
    }
    await Listing.findByIdAndUpdate(id, { ...listingData });
    res.redirect(`/listings/${id}`);
}));

/* ---------- DELETE ---------- */
router.delete("/:id", wrapAsync(async (req, res) => {
    const { id } = req.params;
    await Listing.findByIdAndDelete(id);
    res.redirect("/listings");
}));

module.exports = router;
