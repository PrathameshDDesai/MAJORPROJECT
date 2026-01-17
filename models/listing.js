const mongoose = require("mongoose");
const Review = require("./review");   // REQUIRED for cleanup
const Schema = mongoose.Schema;

const listingSchema = new Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true
        },
        description: {
            type: String,
            required: true,
            trim: true
        },
        price: {
            type: Number,
            required: true,
            min: 0
        },
        location: {
            type: String,
            required: true,
            trim: true
        },
        contact: {
            type: String,
            required: true,
            trim: true
        },
        image: {
            type: String,
            default: "/images/default.jpg"
        },
        reviews: [
            {
                type: Schema.Types.ObjectId,
                ref: "Review"
            }
        ]
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
);

/* 📊 VIRTUAL: Calculate average rating */
listingSchema.virtual("averageRating").get(function () {
    if (!this.reviews || this.reviews.length === 0) {
        return 0;
    }
    const sum = this.reviews.reduce((acc, review) => acc + (review.rating || 0), 0);
    return (sum / this.reviews.length).toFixed(1);
});

/* 🔥 AUTO DELETE REVIEWS WHEN LISTING IS DELETED */
listingSchema.post("findOneAndDelete", async function (doc) {
    if (doc && doc.reviews.length) {
        await Review.deleteMany({
            _id: { $in: doc.reviews }
        });
    }
});

module.exports = mongoose.model("Listing", listingSchema);
