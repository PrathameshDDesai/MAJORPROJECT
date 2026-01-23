const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose").default;

const userSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    fullname: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ["Student", "Owner"],
        default: "Student"
    },
    phoneNumber: {
        type: String,
        required: function () { return this.role === "Owner"; }
    },
    address: {
        type: String,
        required: function () { return this.role === "Owner"; }
    }
});

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", userSchema);