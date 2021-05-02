const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Create a schema for how the data should be held in the database
const userSchema = new Schema({
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
    accountType: {
        type: String,
        require: true
    }
}, {timestamps: true}); // Creates timestamps for creation and updates
let UserData = mongoose.model('UserData', userSchema);
module.exports = UserData;