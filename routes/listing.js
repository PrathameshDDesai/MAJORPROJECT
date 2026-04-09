const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync");
const upload = require("../middleware/upload");
const { isLoggedIn, isOwner } = require("../middleware.js");
const listingController = require("../controllers/listings");

/* ---------- Root Path: INDEX & CREATE ---------- */
router.route("/")
    .get(wrapAsync(listingController.index))
    .post(isLoggedIn, upload.array("imageFiles", 5), wrapAsync(listingController.createListing));

/* ---------- NEW FORM: Render form to create listing ---------- */
router.get("/new", isLoggedIn, listingController.renderNewForm);

/* ---------- ID Path: SHOW, UPDATE & DELETE ---------- */
router.route("/:id")
    .get(wrapAsync(listingController.showListing))
    .patch(isLoggedIn, isOwner, upload.array("imageFiles", 5), wrapAsync(listingController.updateListing))
    .delete(isLoggedIn, isOwner, wrapAsync(listingController.destroyListing));

/* ---------- EDIT FORM: Render form to edit listing ---------- */
router.get("/:id/edit", isLoggedIn, isOwner, wrapAsync(listingController.renderEditForm));


module.exports = router;

