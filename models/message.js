const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const messageSchema = new Schema({
    sender: { 
        type: Schema.Types.ObjectId, 
        ref: "User", 
        required: true 
    },
    receiver: { 
        type: Schema.Types.ObjectId, 
        ref: "User", 
        required: true 
    },
    text: { 
        type: String, 
        required: true 
    },
    read: { 
        type: Boolean, 
        default: false 
    }
}, { timestamps: true });

module.exports = mongoose.model("Message", messageSchema);
