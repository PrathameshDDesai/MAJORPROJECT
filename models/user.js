const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose").default || require("passport-local-mongoose");

// DBMS Threat Detection Regex (SQL & NoSQL injections)
const threatRegex = /(--|;|\bUNION\b|\bSELECT\b|\bDROP\b|\bEXEC\b|\$where|\$ne|\$gt)/i;

const userSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        validate: {
            validator: function(v) {
                return !threatRegex.test(v);
            },
            message: props => `DBMS Security Alert: SQL/NoSQL injection attempt detected in Email!`
        }
    },
    fullname: {
        type: String,
        required: true,
        validate: {
            validator: function(v) {
                return !threatRegex.test(v);
            },
            message: props => `DBMS Security Alert: Malicious characters detected in Full Name!`
        }
    },
    role: {
        type: String,
        enum: ["Student", "Owner", "Admin"],
        default: "Student"
    },
    phoneNumber: {
        type: String,
        required: function () { return this.role === "Owner"; }
    },
    address: {
        type: String,
        required: function () { return this.role === "Owner"; }
    },
    savedListings: [
        {
            type: Schema.Types.ObjectId,
            ref: "Listing"
        }
    ],
    isVerifiedOwner: {
        type: Boolean,
        default: false
    },
    isAdmin: {
        type: Boolean,
        default: false
    },
    isSuspended: {
        type: Boolean,
        default: false
    }
});

// Adding DBMS-level password validation constraint via Passport Plugin
userSchema.plugin(passportLocalMongoose, {
    passwordValidator: function(password, cb) {
        if (threatRegex.test(password)) {
            const errMsg = 'DBMS Security Alert: SQL/NoSQL injection pattern detected in password!';
            if (typeof cb === 'function') {
                return cb({ message: errMsg });
            }
            throw new Error(errMsg); // For async/await usage
        }
        if (typeof cb === 'function') {
            cb(null);
        }
    }
});

module.exports = mongoose.model("User", userSchema);
