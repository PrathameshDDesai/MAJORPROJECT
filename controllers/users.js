const User = require("../models/user");

module.exports.renderSignupForm = (req, res) => {
    res.render("users/signup");
};

module.exports.signup = async (req, res, next) => {
    try {
        const { username, email, password, fullname, role, phoneNumber, address } = req.body;
        
        // Validation is now automatically handled by the Mongoose DBMS model layer!
        const newUser = new User({ email, username, fullname, role, phoneNumber, address });
        
        // This will reject and throw an error if password fails the Passport DBMS validation
        const registeredUser = await User.register(newUser, password);

        req.login(registeredUser, (err) => {
            if (err) return next(err);
            req.flash("success", `Welcome to UniRooms, ${registeredUser.fullname}!`);
            return res.redirect("/listings");
        });
    } catch (e) {
        req.flash("error", e.message);
        res.redirect("/signup");
    }
};

module.exports.renderLoginForm = (req, res) => {
    res.render("users/login");
};

module.exports.login = (req, res) => {
    req.flash("success", `Welcome back, ${req.user.fullname}!`);
    const redirectUrl = res.locals.returnTo || "/listings";
    delete req.session.returnTo;
    res.redirect(redirectUrl);
};

module.exports.logout = (req, res, next) => {
    req.logout((err) => {
        if (err) return next(err);
        req.flash("success", "You have been logged out successfully!");
        res.redirect("/listings");
    });
};

module.exports.renderWishlist = async (req, res) => {
    try {
        const populatedUser = await User.findById(req.user._id).populate({
            path: "savedListings",
            populate: {
                path: "owner"
            }
        });
        res.render("users/wishlist", { savedListings: populatedUser.savedListings || [] });
    } catch (e) {
        req.flash("error", "Could not load wishlist: " + e.message);
        res.redirect("/listings");
    }
};

module.exports.renderDashboard = async (req, res) => {
    try {
        const Booking = require("../models/booking");
        const Listing = require("../models/listing");
        const Verification = require("../models/verification");
        const Review = require("../models/review");
        const User = require("../models/user");
        
        if (req.user.role === "Admin" || req.user.isAdmin) {
            // Fetch Admin Statistics & Data
            const usersCount = await User.countDocuments({});
            const listingsCount = await Listing.countDocuments({});
            const bookingsCount = await Booking.countDocuments({});
            const reviewsCount = await Review.countDocuments({});
            
            const verifications = await Verification.find({}).populate("user").sort({ createdAt: -1 });
            const allUsers = await User.find({}).sort({ createdAt: -1 });
            const allListings = await Listing.find({}).populate("owner").sort({ createdAt: -1 });
            
            return res.render("admin/dashboard", {
                usersCount,
                listingsCount,
                bookingsCount,
                reviewsCount,
                verifications,
                allUsers,
                allListings
            });
        } else if (req.user.role === "Owner") {
            // Fetch Owner Statistics
            const listings = await Listing.find({ owner: req.user._id }).populate("reviews");
            const totalListings = listings.length;
            
            let totalViews = 0;
            let totalRatingsSum = 0;
            let totalRatingsCount = 0;
            
            listings.forEach(listing => {
                totalViews += listing.viewsCount || 0;
                if (listing.reviews && listing.reviews.length > 0) {
                    listing.reviews.forEach(r => {
                        totalRatingsSum += r.rating;
                        totalRatingsCount++;
                    });
                }
            });
            
            const avgRating = totalRatingsCount > 0 ? (totalRatingsSum / totalRatingsCount).toFixed(1) : "N/A";
            const bookings = await Booking.find({ owner: req.user._id }).populate("listing").populate("tenant").sort({ createdAt: -1 });
            
            return res.render("users/owner_dashboard", {
                listings,
                totalListings,
                totalViews,
                avgRating,
                bookings
            });
        } else {
            // Tenant / Student
            const populatedUser = await User.findById(req.user._id).populate({
                path: "savedListings",
                populate: { path: "owner" }
            });
            
            const bookings = await Booking.find({ tenant: req.user._id }).populate("listing").populate("owner").sort({ createdAt: -1 });
            
            return res.render("users/tenant_dashboard", {
                savedListings: populatedUser.savedListings || [],
                bookings
            });
        }
    } catch (e) {
        req.flash("error", "Error loading dashboard: " + e.message);
        res.redirect("/listings");
    }
};

module.exports.deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        const User = require("../models/user");
        const Listing = require("../models/listing");
        
        if (req.user._id.equals(id)) {
            req.flash("error", "You cannot delete your own admin account!");
            return res.redirect("/dashboard");
        }
        
        await User.findByIdAndDelete(id);
        await Listing.deleteMany({ owner: id });
        
        req.flash("success", "User account and all their listings have been deleted.");
        res.redirect("/dashboard");
    } catch (err) {
        req.flash("error", "Failed to delete user: " + err.message);
        res.redirect("/dashboard");
    }
};

