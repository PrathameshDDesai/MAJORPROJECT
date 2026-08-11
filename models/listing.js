const mongoose = require("mongoose");
const Review = require("./review");   // REQUIRED for cleanup
const Schema = mongoose.Schema;

/* ================= LISTING SCHEMA ================= */
// Defines the structure for room listings in the database
const listingSchema = new Schema(
    {
        title: {
            type: String,
            required: [true, "Title is mandatory"],
            trim: true
        },
        description: {
            type: String,
            required: [true, "Description is mandatory"],
            trim: true
        },
        price: {
            type: Number,
            required: [true, "Price is mandatory"],
            min: [0, "Price cannot be negative"]
        },
        location: {
            type: String,
            required: [true, "Location is mandatory"],
            trim: true
        },
        city: {
            type: String,
            required: [true, "City is mandatory"],
            trim: true
        },
        mapLink: {
            type: String,
            trim: true
        },
        gender: {
            type: String,
            required: [true, "Gender preference is mandatory"],
            enum: ["Boys", "Girls", "Any"],
            default: "Any"
        },
        contact: {
            type: String,
            required: [true, "Contact information is mandatory"],
            trim: true
        },
        images: [
            {
                type: String,
                default: "/images/default.jpeg"
            }
        ],
        reviews: [
            {
                type: Schema.Types.ObjectId,
                ref: "Review" // Reference to the Review model
            }
        ],
        owner: {
            type: Schema.Types.ObjectId,
            ref: "User" // Reference to the User model (listing owner)
        },
        coordinates: {
            type: [Number], // [lng, lat]
            default: [72.8777, 19.0760] // Default to Mumbai coordinates
        },
        viewsCount: {
            type: Number,
            default: 0
        },
        isHidden: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true, // Automatically adds createdAt and updatedAt
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
);

/* VIRTUAL: Calculate average rating dynamically */
// Virtual properties are not stored in DB, but calculated on the fly
listingSchema.virtual("averageRating").get(function () {
    if (!this.reviews || this.reviews.length === 0) {
        return 0; // Default to 0 if no reviews exist
    }
    const sum = this.reviews.reduce((acc, review) => acc + (review.rating || 0), 0);
    return (sum / this.reviews.length).toFixed(1);
});

/*  QUERY MIDDLEWARE: Cascade delete reviews when a listing is removed */
// This triggers when findOneAndDelete (e.g., delete route) is called
listingSchema.post("findOneAndDelete", async function (doc) {
    if (doc && doc.reviews.length) {
        await Review.deleteMany({
            _id: { $in: doc.reviews }
        });
    }
});

// Compile and export the Listing model
module.exports = mongoose.model("Listing", listingSchema);
