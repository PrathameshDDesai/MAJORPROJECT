const express = require("express");
const router = express.Router({ mergeParams: true });

const wrapAsync = require("../utils/wrapAsync");
const { isLoggedIn, isReviewAuthor } = require("../middleware.js");
const reviewController = require("../controllers/reviews");

/**
 * @route   POST /listings/:id/reviews
 * @desc    CREATE: Add a new review to a listing
 */
router.post("/", isLoggedIn, wrapAsync(reviewController.createReview));

/**
 * @route   ID Path /listings/:id/reviews/:reviewId
 * @desc    UPDATE and DELETE reviews
 */
router.route("/:reviewId")
    .patch(isLoggedIn, isReviewAuthor, wrapAsync(reviewController.updateReview))
    .delete(isLoggedIn, isReviewAuthor, wrapAsync(reviewController.destroyReview));


module.exports = router;

