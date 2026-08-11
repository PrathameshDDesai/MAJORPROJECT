const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const bookingSchema = new Schema({
    listing: { 
        type: Schema.Types.ObjectId, 
        ref: "Listing", 
        required: true 
    },
    tenant: { 
        type: Schema.Types.ObjectId, 
        ref: "User", 
        required: true 
    },
    owner: { 
        type: Schema.Types.ObjectId, 
        ref: "User", 
        required: true 
    },
    visitDate: { 
        type: Date, 
        required: true 
    },
    status: { 
        type: String, 
        enum: ["Pending", "Accepted", "Rejected", "Completed"], 
        default: "Pending" 
    },
    remarks: { 
        type: String, 
        default: "" 
    }
}, { timestamps: true });

module.exports = mongoose.model("Booking", bookingSchema);
