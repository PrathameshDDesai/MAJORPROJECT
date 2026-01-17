const express = require("express");
const router = express.Router({ mergeParams: true });

const wrapAsync = require("../utils/wrapAsync");
const Listing = require("../models/listing");
const Review = require("../models/review");
const upload = require("../middleware/upload");
const ExpressError = require("../utils/ExpressError");



/* ---------- REVIEWS: CREATE ---------- */
router.post("/", wrapAsync(async (req, res) => {
    const listing = await Listing.findById(req.params.id);

    // TODO: Replace with actual user ID from session when auth is implemented
    // For now, reviews will be created without an author until authentication is implemented

    const newReview = new Review(req.body.review);

    listing.reviews.push(newReview);

    await newReview.save();
    await listing.save();

    res.redirect(`/listings/${listing._id}`);
}));

/* ---------- REVIEWS: UPDATE ---------- */
router.patch("/:reviewId", wrapAsync(async (req, res) => {
    const { rating, comment } = req.body.review;

    await Review.findByIdAndUpdate(req.params.reviewId, {
        rating,
        comment
    });

    res.redirect(`/listings/${req.params.id}`);
}));

/* ---------- REVIEWS: DELETE ---------- */
router.delete("/:reviewId", wrapAsync(async (req, res) => {
    // Remove review from listing's reviews array
    await Listing.findByIdAndUpdate(req.params.id, {
        $pull: { reviews: req.params.reviewId }
    });

    // Delete the review document
    await Review.findByIdAndDelete(req.params.reviewId);

    res.redirect(`/listings/${req.params.id}`);
}));


// export modules
module.exports = router;