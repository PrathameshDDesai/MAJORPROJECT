const Verification = require("../models/verification");
const User = require("../models/user");

// Render Owner Verification Form
module.exports.renderForm = async (req, res) => {
    try {
        const existingRequest = await Verification.findOne({ user: req.user._id });
        res.render("users/verification", { request: existingRequest });
    } catch (e) {
        req.flash("error", "Failed to load verification form: " + e.message);
        res.redirect("/listings");
    }
};

// Process Verification Submission
module.exports.submitForm = async (req, res) => {
    try {
        const { fullName, phone, propertyAddress } = req.body;
        
        let verification = await Verification.findOne({ user: req.user._id });
        if (verification) {
            verification.fullName = fullName;
            verification.phone = phone;
            verification.propertyAddress = propertyAddress;
            verification.status = "Pending";
            verification.remarks = "";
            await verification.save();
        } else {
            verification = new Verification({
                user: req.user._id,
                fullName,
                phone,
                propertyAddress,
                status: "Pending"
            });
            await verification.save();
        }
        
        req.flash("success", "Verification request submitted successfully. It is now under review.");
        res.redirect("/listings");
    } catch (e) {
        req.flash("error", "Error submitting verification request: " + e.message);
        res.redirect("/users/verify");
    }
};

// Admin: View All Verification Requests
module.exports.adminIndex = async (req, res) => {
    try {
        const verifications = await Verification.find({}).populate("user").sort({ createdAt: -1 });
        res.render("admin/verifications", { verifications });
    } catch (e) {
        req.flash("error", "Failed to retrieve verifications: " + e.message);
        res.redirect("/listings");
    }
};

// Admin: Approve Owner Verification
module.exports.approve = async (req, res) => {
    try {
        const { id } = req.params;
        const verification = await Verification.findById(id);
        if (!verification) {
            req.flash("error", "Verification request not found.");
            return res.redirect("/admin/verifications");
        }
        
        verification.status = "Approved";
        verification.remarks = req.body.remarks || "Approved by admin";
        await verification.save();
        
        // Update user state
        await User.findByIdAndUpdate(verification.user, { isVerifiedOwner: true });
        
        req.flash("success", "Owner verified successfully!");
        res.redirect("/admin/verifications");
    } catch (e) {
        req.flash("error", "Failed to approve owner: " + e.message);
        res.redirect("/admin/verifications");
    }
};

// Admin: Reject Owner Verification
module.exports.reject = async (req, res) => {
    try {
        const { id } = req.params;
        const { remarks } = req.body;
        
        const verification = await Verification.findById(id);
        if (!verification) {
            req.flash("error", "Verification request not found.");
            return res.redirect("/admin/verifications");
        }
        
        verification.status = "Rejected";
        verification.remarks = remarks || "Rejected by admin";
        await verification.save();
        
        // Update user state (just in case they were previously approved)
        await User.findByIdAndUpdate(verification.user, { isVerifiedOwner: false });
        
        req.flash("success", "Owner verification request rejected.");
        res.redirect("/admin/verifications");
    } catch (e) {
        req.flash("error", "Failed to reject owner: " + e.message);
        res.redirect("/admin/verifications");
    }
};
