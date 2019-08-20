var mongoose = require("mongoose");

var userSchema = mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true
    },
    meta: {
        admin: {
            type: Boolean,
            required: true,
            default: false
        }, 
        emailVerified: {
            type: Boolean,
            default: false,
        },
        emailVerificationToken: String,
        emailVerificationTokenExp: Date,
        passwordResetToken: String,
        passwordResetTokenExp: Date
    }
}, { timestamps: true });

/**
 * Show users joined date
 * @return {string}
 */
userSchema.virtual('joinedSince').get(function () {
    return this.createdAt.toLocaleDateString();
});

module.exports = mongoose.model("User", userSchema);
