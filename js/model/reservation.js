const mongoose = require("mongoose");
const Schema = mongoose.Schema; // Create variable to sub

// Create a schema for how the data should be held in the database
const reservationSchema = new Schema({
    username: {
        type: String,
        require: true
    },
    name: {
        type: String,
        require: true
    },
    email: {
        type: String,
        require: true
    },
    phone: {
        type: String,
        require: true
    },
    bookFor: {
        type: Date,
        require: true,
        // Validates date is not in the past
        validate: function(date) {
            return typeof new Date(date) > new Date();
        }
    },
    custNum: {
        type: Number,
        require: true
    },
    location: {
        type: String,
        require: true
    },
    additional_note: {
        type: String
    },
    pending: {
        type: Boolean,
        default: true,
        require: true
    }
}, {timestamps: true}); // Creates timestamps for creation and updates
const reservData = mongoose.model('reservData', reservationSchema);
module.exports = reservData;