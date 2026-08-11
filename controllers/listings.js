const Listing = require("../models/listing");

module.exports.index = async (req, res) => {
    const allListings = await Listing.find({ isHidden: { $ne: true } }).populate("owner").sort({ createdAt: -1 });
    res.render("listings/index", { allListings });
};

module.exports.renderNewForm = (req, res) => {
    res.render("listings/new");
};

module.exports.showListing = async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id)
        .populate({
            path: "reviews",
            populate: {
                path: "author"
            }
        })
        .populate("owner");

    if (!listing) {
        req.flash("error", "The listing you are looking for does not exist!");
        return res.redirect("/listings");
    }

    if (listing.isHidden) {
        const isOwnerOrAdmin = req.user && (listing.owner._id.equals(req.user._id) || req.user.role === 'Admin' || req.user.isAdmin);
        if (!isOwnerOrAdmin) {
            req.flash("error", "This listing is currently hidden by the owner.");
            return res.redirect("/listings");
        }
    }

    res.render("listings/show", { listing });
};


module.exports.createListing = async (req, res) => {
    const listingData = req.body.listing;
    listingData.images = [];

    // Handle multiple uploaded files
    if (req.files && req.files.length > 0) {
        req.files.forEach(file => {
            listingData.images.push(`/uploads/${file.filename}`);
        });
    }

    // Handle multiple image URLs if provided
    if (req.body.imageUrls) {
        const urls = Array.isArray(req.body.imageUrls) ? req.body.imageUrls : [req.body.imageUrls];
        urls.forEach(url => {
            if (url && url.trim() !== "") {
                listingData.images.push(url.trim());
            }
        });
    }

    // Fallback if no images provided
    if (listingData.images.length === 0) {
        listingData.images = ["/images/default.jpeg"];
    }

    const newListing = new Listing(listingData);

    newListing.owner = req.user._id;
    await newListing.save();

    req.flash("success", "New Listing Created with multiple images!");
    res.redirect("/listings");
};

module.exports.renderEditForm = async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);

    if (!listing) {
        req.flash("error", "The listing you want to edit does not exist!");
        return res.redirect("/listings");
    }
    res.render("listings/edit", { listing });
};

module.exports.updateListing = async (req, res) => {
    const { id } = req.params;
    const listingData = req.body.listing;

    const listing = await Listing.findById(id);
    if (!listing) {
        req.flash("error", "Listing not found!");
        return res.redirect("/listings");
    }

    let updatedImages = listing.images || [];

    if (req.body.deleteImages) {
        const toDelete = Array.isArray(req.body.deleteImages) ? req.body.deleteImages : [req.body.deleteImages];
        updatedImages = updatedImages.filter(img => !toDelete.includes(img));
    }

    if (req.files && req.files.length > 0) {
        req.files.forEach(file => {
            updatedImages.push(`/uploads/${file.filename}`);
        });
    }

    if (req.body.imageUrls) {
        const urls = Array.isArray(req.body.imageUrls) ? req.body.imageUrls : [req.body.imageUrls];
        urls.forEach(url => {
            if (url && url.trim() !== "") {
                updatedImages.push(url.trim());
            }
        });
    }

    if (updatedImages.length === 0) {
        updatedImages = ["/images/default.jpeg"];
    }

    listingData.images = updatedImages;

    await Listing.findByIdAndUpdate(id, { ...listingData });
    req.flash("success", "Listing updated successfully!");
    res.redirect(`/listings/${id}`);
};

module.exports.destroyListing = async (req, res) => {
    const { id } = req.params;
    await Listing.findByIdAndDelete(id);
    req.flash("success", "Listing deleted!");
    res.redirect("/listings");
};

module.exports.toggleWishlist = async (req, res) => {
    try {
        const { id } = req.params;
        const User = require("../models/user");
        const user = await User.findById(req.user._id);
        
        const listingIndex = user.savedListings.indexOf(id);
        let saved = false;
        
        if (listingIndex === -1) {
            user.savedListings.push(id);
            saved = true;
        } else {
            user.savedListings.splice(listingIndex, 1);
            saved = false;
        }
        
        await user.save();
        res.json({ success: true, saved });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
};

module.exports.toggleVisibility = async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
        req.flash("error", "Listing not found!");
        return res.redirect("/listings");
    }
    listing.isHidden = !listing.isHidden;
    await listing.save();
    req.flash("success", listing.isHidden ? "Listing is now hidden from public view." : "Listing is now published and visible to public!");
    res.redirect(req.headers.referer || `/listings/${id}`);
};

