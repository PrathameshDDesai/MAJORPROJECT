const mongoose = require("mongoose");
const Schema = mongoose.Schema;

/* ================= REVIEW SCHEMA ================= */
// Defines the structure for room reviews in the database
const reviewSchema = new Schema(
    {
        rating: {
            type: Number,
            required: [true, "Rating is required"], // Ensure a rating exists
            min: 1, // Minimum 1 star
            max: 5  // Maximum 5 stars
        },
        comment: {
            type: String,
            required: [true, "Comment cannot be empty"], // Ensure text is provided
            trim: true
        },
        author: {
            type: Schema.Types.ObjectId,
            ref: "User"
        }
    },
    {
        timestamps: true // Automatically track when reviews are created/updated
    }
);

// Compile and export the Review model
module.exports = mongoose.model("Review", reviewSchema);
