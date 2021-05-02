const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Create a schema for how the data should be held in the database
const user = new Schema({
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
module.exports = User = mongoose.model('User', user);