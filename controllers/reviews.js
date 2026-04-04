const Listing = require("../models/listing");
const Review = require("../models/review");

module.exports.createReview = async (req, res) => {
    const listing = await Listing.findById(req.params.id);
    if (!listing) {
        req.flash("error", "Listing not found!");
        return res.redirect("/listings");
    }

    const newReview = new Review(req.body.review);
    newReview.author = req.user._id;
    listing.reviews.push(newReview);

    await newReview.save();
    await listing.save();

    req.flash("success", "Review submitted!");
    res.redirect(`/listings/${listing._id}`);
};

module.exports.updateReview = async (req, res) => {
    const { rating, comment } = req.body.review;

    await Review.findByIdAndUpdate(req.params.reviewId, {
        rating,
        comment
    });

    req.flash("success", "Review updated!");
    res.redirect(`/listings/${req.params.id}`);
};

module.exports.destroyReview = async (req, res) => {
    const { id, reviewId } = req.params;

    await Listing.findByIdAndUpdate(id, {
        $pull: { reviews: reviewId }
    });

    await Review.findByIdAndDelete(reviewId);

    req.flash("success", "Review deleted!");
    res.redirect(`/listings/${id}`);
};
