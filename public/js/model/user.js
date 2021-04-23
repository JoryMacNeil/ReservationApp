const mongoose = require("mongoose");
const Schema = mongoose.schema; // Create variable to sub

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
    }
}, {timestamps: true}); // Creates timestamps for creation and updates

const UserData = mongoose.model('UserData', userSchema);
module.exports = UserData;