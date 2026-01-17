const express  = require("express");
const router = express.Router();

const upload = require("./middleware/upload");

/* ---------- CREATE ---------- */
router.post("/", upload.single("imageFile"), wrapAsync(async (req, res, next) => {

    const listingData = req.body.listing;

    // IMAGE LOGIC (NO DELAY, NO BREAK)
    if (req.file) {
        listingData.image = `/uploads/${req.file.filename}`;
    } else if (!listingData.image) {
        listingData.image = "/images/default.jpg";
    }

    await Listing.create(listingData);
    res.redirect("/listings");

})
);

/* ---------- EDIT FORM ---------- */
router.get("/:id/edit", wrapAsync(async (req, res) => {
    try {
        const listing = await Listing.findById(req.params.id);
        if (!listing) return res.status(404).send("Listing not found");

        res.render("listings/edit", { listing });
    } catch (err) {
        console.error(err);
        res.status(500).send("Error loading edit page");
    }
}));




/* ---------- UPDATE ---------- */
router.patch("/:id", upload.single("imageFile"), async (req, res) => {
    try {
        const listingData = req.body.listing;

        if (req.file) {
            listingData.image = `/uploads/${req.file.filename}`;
        }

        await Listing.findByIdAndUpdate(req.params.id, listingData, {
            runValidators: true,
            new: true
        });

        res.redirect(`/listings/${req.params.id}`);
    } catch (err) {
        console.error(err);
        res.status(500).send("Failed to update listing");
    }
});

/* ---------- DELETE ---------- */
router.delete("/:id", async (req, res) => {
    try {
        await Listing.findByIdAndDelete(req.params.id);
        res.redirect("/listings");
    } catch (err) {
        console.error(err);
        res.status(500).send("Failed to delete listing");
    }
});


// HOME → listings
router.get("/", (req, res) => {
    res.redirect("/listings");
});

/* ---------- INDEX ---------- */
router.get("/", wrapAsync(async (req, res) => {
    try {
        const allListings = await Listing.find({});
        res.render("listings/index", { allListings });
    } catch (err) {
        console.error(err);
        res.status(500).send("Failed to load listings");
    }
})
);

/* ---------- NEW FORM ---------- */
router.get("/new", (req, res) => {
    res.render("listings/new");
});



/* ---------- SHOW ---------- */
router.get("/:id", wrapAsync(async (req, res) => {
    try {
        const listing = await Listing.findById(req.params.id).populate("reviews");
        if (!listing) return res.status(404).send("Listing not found");

        res.render("listings/show", { listing });
    } catch (err) {
        console.error(err);
        res.status(500).send("Error loading listing");
    }
})
);


// export modules
module.exports = router ;