const mongoose = require("mongoose");

// Create a schema for how the data should be held in the database
const userSchema = new mongoose.Schema({
    username: {
        type: String,
        unique: true,   // Username Must Be Unique
        require: true   // Must Require A Username
    },
    email: {
        type: String,
        require: true   // Must Require an Email
    },
    password: {
        type: String,
        require: true   // Must Require a Password
    },
    accType: {
        type: String,
        require: true   // Must Require a Account Type
    }
}, {timestamps: true}); // Creates timestamps for creation and updates

const UserData = mongoose.model('UserData', userSchema);
module.exports = UserData;