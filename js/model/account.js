const mongoose = require("mongoose");
const Schema = mongoose.Schema;
// Create a schema for how the data should be held in the database
const accountDataSchema = new Schema({
    userID: {   // One-to-One relationship with the Userdata's ObjectID
        type: Schema.Types.ObjectId,
        ref: 'userData',    // references UserData
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