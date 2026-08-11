const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync");
const upload = require("../middleware/upload");
const { isLoggedIn, isOwner, isVerifiedOwner } = require("../middleware.js");
const listingController = require("../controllers/listings");

/* ---------- Root Path: INDEX & CREATE ---------- */
router.route("/")
    .get(wrapAsync(listingController.index))
    .post(isLoggedIn, isVerifiedOwner, upload.array("imageFiles", 5), wrapAsync(listingController.createListing));

/* ---------- NEW FORM: Render form to create listing ---------- */
router.get("/new", isLoggedIn, isVerifiedOwner, listingController.renderNewForm);

/* ---------- ID Path: SHOW, UPDATE & DELETE ---------- */
router.route("/:id")
    .get(wrapAsync(listingController.showListing))
    .patch(isLoggedIn, isOwner, isVerifiedOwner, upload.array("imageFiles", 5), wrapAsync(listingController.updateListing))
    .delete(isLoggedIn, isOwner, isVerifiedOwner, wrapAsync(listingController.destroyListing));

/* ---------- EDIT FORM: Render form to edit listing ---------- */
router.get("/:id/edit", isLoggedIn, isOwner, isVerifiedOwner, wrapAsync(listingController.renderEditForm));

/* ---------- WISHLIST ACTION ---------- */
router.post("/:id/wishlist", isLoggedIn, wrapAsync(listingController.toggleWishlist));

/* ---------- VISIBILITY TOGGLE ACTION ---------- */
router.post("/:id/toggle-visibility", isLoggedIn, isOwner, wrapAsync(listingController.toggleVisibility));

module.exports = router;


