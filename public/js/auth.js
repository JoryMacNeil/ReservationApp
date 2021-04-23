// Code Adapted from WEB322-A6
// PRJ666Admin - PRJ666-Password
//mongodb+srv://PRJ666Admin:PRJ666-Password@prj666-cluster.n7led.mongodb.net/PRJ666DB?retryWrites=true&w=majority

const mongoose = require("mongoose");
const Schema = mongoose.schema; // Create variable to sub

const bcrypt = require("bcryptjs");

const UserData = require('./model/user');

// Exported registerUser function
module.exports.registerUser = function(userData) {
    return new Promise (function(resolve, reject) {
        if(userData.Password != userData.checkPassword) {
            // Check if password is the same for re-entered password
            reject("Passwords Do Not Match");
        }
        else {
            // Generates salt for Hashing password
            bcrypt.genSalt(12, function(err, salt){
                // Hash password
                bcrypt.hash(userData.Password, salt, function(err, hash) {
                    // Check for errors while hashing password
                    if(err) {
                        // Reject and send error message
                        reject("There was an error encrypting the password");
                    }
                    else {
                        // // Set password as hashed password (NEVER STORE UNHASHED PASSWORDS)
                         userData.password = hash;

                        // Create the new user
                        let newUser = new UserData(userData);

                        // Attempts to save user into DB
                        newUser.save((err)=> {
                            // Check for errors while saving new user
                            if(err) {
                                // Check for error code 11000, unique key viloations
                                if(err.code == 11000){
                                    // Reject and output error message
                                    reject("User Name Already Taken");
                                }
                                
                                // Reject and output error message when a different error has occured
                                reject(`There was an error creating user: ${err}`);
                            }
                            else {
                                // Resovle
                                resolve();
                                console.log("User Successfully Saved");
                                console.log(newUser);
                            };
                        });

                    };

                });

            });

        };
    });
}; //   END OF REGISTERUSER


module.exports.checkUser = function(userData) {
    return new Promise (function(resovle, reject) {
        // Finde user that matches the username (for login)
        User.find({
            userName: userData.userName
        }).exec()   // Tells mongoose to return a promise
        .then((user)=> {    // Get users array
            // If user exist in the users array
            if(users) {
                // Comparte encrypted password
                bcrypt.compare(userData.password, users[0].password)
                .then((res)=> {
                    if (res == true) {
                        // Create new loginHistory for logging
                        users[0].loginHistory.push({
                            // Set new time logined in
                            dateTime: (new Date()).toString(),
                            // Set userAgent
                            userAgent: userData.userAgent
                        });

                        User.update(
                            {userName: users[0].username},
                            // Add new loginHistory
                            {$set: {loginHistory: users[0].loginHistory}},
                            {multi: false}
                        ).exec().then((()=>{
                            // Resolve and output user's data
                            resolve(users[0]);

                        })).catch((err)=> {
                            // Reject and output error message
                            reject(`There was an error verifying the user: ${err}`);
                        });
                    }
                    else {
                        // Reject and output error message for incorrect password
                        reject(`Incorrect Password for user: ${userData.userName}`);
                    }

                });
            }
            else {
                // Reject and output error message for user not in the database
                reject(`Unable to find user: ${userData.userName}`);
            }

        }).catch(()=> {
            // Reject and output error message for user inputting username that does not exists
            reject(`Unable to find user: ${userData.username}`);
        });
    });
};