const Listing = require("./models/listing");
const Review = require("./models/review");

// Placeholder middleware file - Auth logic has been removed.
module.exports.isLoggedIn = (req, res, next) => {
    next();
};

module.exports.saveRedirectUrl = (req, res, next) => {
    next();
};

module.exports.isOwner = async (req, res, next) => {
    next();
};

module.exports.isReviewAuthor = async (req, res, next) => {
    next();
};
