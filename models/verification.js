const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const verificationSchema = new Schema({
    user: { 
        type: Schema.Types.ObjectId, 
        ref: "User", 
        required: true 
    },
    fullName: { 
        type: String, 
        required: true 
    },
    phone: { 
        type: String, 
        required: true 
    },
    propertyAddress: { 
        type: String, 
        required: true 
    },
    remarks: { 
        type: String, 
        default: "" 
    },
    status: { 
        type: String, 
        enum: ["Pending", "Approved", "Rejected"], 
        default: "Pending" 
    }
}, { timestamps: true });

module.exports = mongoose.model("Verification", verificationSchema);
