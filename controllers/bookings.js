const Booking = require("../models/booking");
const Listing = require("../models/listing");

// Create a new Visit Request
module.exports.create = async (req, res) => {
    try {
        const { listingId, visitDate, remarks } = req.body;
        const listing = await Listing.findById(listingId);
        
        if (!listing) {
            req.flash("error", "Listing not found.");
            return res.redirect("/listings");
        }
        
        // Block owner booking their own listing
        if (listing.owner.equals(req.user._id)) {
            req.flash("error", "You cannot request a visit for your own property!");
            return res.redirect(`/listings/${listingId}`);
        }
        
        const booking = new Booking({
            listing: listingId,
            tenant: req.user._id,
            owner: listing.owner,
            visitDate,
            remarks,
            status: "Pending"
        });
        
        await booking.save();
        req.flash("success", "Visit request submitted successfully! Owner will review it.");
        res.redirect(`/listings/${listingId}`);
    } catch (e) {
        req.flash("error", "Error creating booking request: " + e.message);
        res.redirect("/listings");
    }
};

// Owner: Update Visit Request Status
module.exports.updateStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, remarks } = req.body; // Approved, Rejected, Completed
        
        const booking = await Booking.findById(id);
        if (!booking) {
            req.flash("error", "Booking request not found.");
            return res.redirect("/dashboard");
        }
        
        // Authorize: Only the listing owner can update status
        if (!booking.owner.equals(req.user._id)) {
            req.flash("error", "Unauthorized access.");
            return res.redirect("/dashboard");
        }
        
        booking.status = status;
        if (remarks) {
            booking.remarks = remarks;
        }
        await booking.save();
        
        req.flash("success", `Visit request marked as ${status}!`);
        res.redirect("/dashboard");
    } catch (e) {
        req.flash("error", "Failed to update visit status: " + e.message);
        res.redirect("/dashboard");
    }
};
