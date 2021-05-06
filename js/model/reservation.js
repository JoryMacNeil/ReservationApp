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
        require: true
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
    }
}, {timestamps: true}); // Creates timestamps for creation and updates
const reservData = mongoose.model('reservData', reservationSchema);
module.exports = reservData;