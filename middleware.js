const Listing = require("./models/listing");
const Review = require("./models/review");

// Placeholder middleware file - Auth logic has been removed.
// Check if user is authenticated
module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.returnTo = req.originalUrl;
        req.flash("error", "You must be logged in to do that!");
        return res.redirect("/login");
    }
    next();
};

module.exports.saveRedirectUrl = (req, res, next) => {
    if (req.session.returnTo) {
        res.locals.returnTo = req.session.returnTo;
    }
    next();
};

module.exports.isOwner = async (req, res, next) => {
    let { id } = req.params;
    let listing = await Listing.findById(id);
    if (!listing) {
        req.flash("error", "Listing not found!");
        return res.redirect("/listings");
    }
    // Allow Admins / Host users to manage any listing
    if (res.locals.currUser && (res.locals.currUser.isAdmin || res.locals.currUser.role === "Admin")) {
        return next();
    }
    if (!listing.owner || !listing.owner.equals(res.locals.currUser._id)) {
        req.flash("error", "You do not have permission to do that!");
        return res.redirect(`/listings/${id}`);
    }
    next();
};

module.exports.isReviewAuthor = async (req, res, next) => {
    let { id, reviewId } = req.params;
    let review = await Review.findById(reviewId);
    if (!review.author || !review.author.equals(res.locals.currUser._id)) {
        req.flash("error", "You are not the author of this review");
        return res.redirect(`/listings/${id}`);
    }
    next();
};

module.exports.isVerifiedOwner = (req, res, next) => {
    if (req.user && req.user.role === "Owner" && !req.user.isVerifiedOwner) {
        req.flash("error", "Your owner verification is pending or rejected. You cannot publish or edit listings.");
        return res.redirect("/dashboard");
    }
    next();
};

module.exports.isAdmin = (req, res, next) => {
    if (!req.isAuthenticated() || !req.user.isAdmin) {
        req.flash("error", "Access denied. Admins only.");
        return res.redirect("/listings");
    }
    next();
};
