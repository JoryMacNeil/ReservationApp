const mongoose = require("mongoose");
const Schema = mongoose.Schema;
// Create a schema for how the data should be held in the database
const accountDataSchema = new Schema({
    userID: {
        type: Schema.Types.ObjectId,
        ref: 'userData',
        require: true
    },
    username: {
        type: String,
        require: true
    },
    accountType: {
        type: String,
        require: true
    }
});
let accountData = mongoose.model('accountData', accountDataSchema);
module.exports = accountData;