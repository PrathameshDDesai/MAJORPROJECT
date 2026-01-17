const express = require("express");
const router = express.Router({ mergeParams: true });

const wrapAsync = require("../utils/wrapAsync");
const Listing = require("../models/listing");
const Review = require("../models/review");
const upload = require("../middleware/upload");
const ExpressError = require("../utils/ExpressError");

/**
 * @route   POST /listings/:id/reviews
 * @desc    CREATE: Add a new review to a listing
 */
router.post("/", wrapAsync(async (req, res) => {
    const listing = await Listing.findById(req.params.id);
    if (!listing) {
        req.flash("error", "Listing not found!");
        return res.redirect("/listings");
    }

    const newReview = new Review(req.body.review);
    listing.reviews.push(newReview);

    await newReview.save();
    await listing.save();

    req.flash("success", "Review submitted!");
    res.redirect(`/listings/${listing._id}`);
}));

/**
 * @route   PATCH /listings/:id/reviews/:reviewId
 * @desc    UPDATE: Edit an existing review
 */
router.patch("/:reviewId", wrapAsync(async (req, res) => {
    const { rating, comment } = req.body.review;

    await Review.findByIdAndUpdate(req.params.reviewId, {
        rating,
        comment
    });

    req.flash("success", "Review updated!");
    res.redirect(`/listings/${req.params.id}`);
}));

/**
 * @route   DELETE /listings/:id/reviews/:reviewId
 * @desc    DELETE: Remove a review and update the listing's reference
 */
router.delete("/:reviewId", wrapAsync(async (req, res) => {
    const { id, reviewId } = req.params;

    // Remove the review's ID from the listing the reviews array
    await Listing.findByIdAndUpdate(id, {
        $pull: { reviews: reviewId }
    });

    // Delete the actual review document
    await Review.findByIdAndDelete(reviewId);

    req.flash("success", "Review deleted!");
    res.redirect(`/listings/${id}`);
}));

module.exports = router;
