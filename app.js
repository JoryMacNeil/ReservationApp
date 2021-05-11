const clientSessions = require ("client-sessions");
const bcrypt = require("bcryptjs");
const exphbs = require("express-handlebars");

const mongoose = require("mongoose");
const dbURI = "mongodb+srv://PRJ666-Admin:PRJ666-Password@prj666-cluster.efkzi.mongodb.net/PRJ666?retryWrites=true&w=majority";
mongoose.connect(dbURI, {useNewUrlParser: true, useUnifiedTopology:true, useCreateIndex: true, useFindAndModify: false})
.then(() =>{
    console.log("Successfully Connected to Database");
    app.listen(8080);
}).catch((err) => {
    console.log(`Error: "${err}" found`);
});

const User = require('./js/model/user');
//const accountData = require('./js/model/account')
const reservData = require('./js/model/reservation');

const express = require("express");
// Create express app
const app = express();

// Create new view engine
 app.engine('.hbs', exphbs({
     extname: '.hbs',
     defaultLayout: '',
     helpers: {
         ifEqual: function(obj, val, options) {
             if(obj == val) {
               return options.fn(this);
             }
             else {
                 return options.inverse(this);
             }
         }
     }
    }));

// Set .hbs files as view engine
app.set('view engine', '.hbs');

app.use((req, res, next) => {
    let route = req.baseUrl + req.path;
    //app.locals.activeRoute = (route == "/") ? "/" : route.replace(/\/$/, "");
    next();
});

app.use(express.static('public'));

app.use(clientSessions(
    {
        cookieName: "session",
        secret: "prj666-reservation-application",
        duration: 20 * 60 * 1000,    // 20 minute
        activeDuration: 10 * 1000 * 60   // 10 minute
    }
));
app.use((req, res, next) => {
    res.locals.session = req.session;
    next();
});
app.use(express.urlencoded({extended: true}));

let ensureLogin = (req, res, next) => {
    if (req.session.user) {
        next();
    }
    else {
        res.render('index');
    }
}

// Gets the index.html from server and loads it to browser
app.get("/", ensureLogin, (req, res) => {
    res.render('index');
});

// Gets the about-us.html from server and loads it to browser
app.get("/about-us", ensureLogin, (req, res) => {
    res.render('about-us');
});

// redirects path to about-us path
app.get("/about", ensureLogin, (req, res) => {
    res.redirect('/about-us');
});

// Gets the menu.html from server and loads it to browser
app.get("/menu", ensureLogin, (req, res) => {
    res.render('menu');
});

//Gets staffReservation
app.get("/staff", ensureLogin, (req, res) => {
    reservData.find({
        pending: true   // Only search for reservations that are pending
    }).lean()
    .then((reservs) => {
        // console.log(reservs);
        res.render('staff', {reservation: reservs});
    })
    .catch((err) => {
        console.log(`Error: "${err}" found while getting reservations`);
        res.render('staff');
    });
});

// Update Reservation's pending status (NEVER DELETE DATA FOR LOGGING PURPOSES)
app.post("/staff", ensureLogin, (req, res) => {
    // Finds and updates reservation's data
    reservData.findOneAndUpdate(
        {_id: req.body.submit}, // Used the submit buttons value to identify one reservation from anothers
        {pending: false},   // Sets pending to false
        (err, data) => {    // Callback function to detect errors
            if(err) {
                console.log(`Error: "${err}" found while updating reservation`);    // Outputs error to console
            }
            else {
                console.log(`Reservation successfully updated`); // Outputs success to console
            }
        }
    ).then(reservs => {
       //console.log(reservs);

       // Refresh the page to show updated list of pending reservations
        res.redirect('/staff');
    })
});

// Gets the reservation.html from server and loads it to browser
app.get("/reservation", ensureLogin, (req, res) => {
    res.render('reservation');
});

app.post("/reservation", ensureLogin, (req, res) => {
    let today = new Date(); // Gets todays date and time

    if (req.body.bookFor <= today) {    // Check if the date and time is today or in the past
        res.render("reservation", {dateTimeErr: "Date and time unavailable"});   // Reloads page with error message displayed
    } 
    else {
        //console.log(req.body.people);

        reservData.find({
            username: req.session.user.username,
            bookFor: req.body.bookFor,
            pending: true
        })
        .then(reservs => {
            console.log(reservs[0]);

            if(reservs[0]) {
                res.render("reservation", {dateTimeErr: "Cannot make two reservations for the same date and time"});   // Reloads page with error message displayed
                console.log("Cannot make two reservations for the same date and time");
            }
            else {
                // Make new Reservation object
                let newReserv = new reservData({
                    username: req.session.user.username,
                    name: req.body.name,
                    email: req.body.email,
                    phone: req.body.phone,
                    bookFor: req.body.bookFor,
                    custNum: req.body.people,
                    location: req.body.location,
                    additional_note: req.body.message,
                    pending: true
                });

                console.log(newReserv);
                //console.log(`ObjectId: ${newReserv._id}`);
        
                // Attempts to save object into database
                newReserv.save((err) => {
                    if (err) {
                        // Outputs error message
                        console.log(`Error: ${err}, occurred while saving new Reservation`);
                    }
                    else { 
                        // Outputs success message
                        console.log("Reservation Sucessfully Made");
                        //console.log(`ObjectId: ${newReserv._id}`);

                        res.redirect(`/display/${newReserv._id}`);
                    }
                });
            }
        });
    }
});

// Default path for Display
app.get("/display", ensureLogin, (req, res) => {
    res.render("display");
});

// Gets display and pass id params
app.get("/display/:id", ensureLogin, (req, res) => {
    reservData.find({
        _id: req.params.id,
        pending: true
    })
    .lean()
    .then((result) => {
        if(result) {
            //console.log(result[0]);
            res.render("display", {reservation: result[0]});  // Render display page
        }
        else {
            res.redirect('/display');
        }
    })
    .catch(err => {
        console.log(`Error: "${err}" found while fetching new reservation data`);
    });

});

// Gets display and pass id params
app.post("/display/:id", ensureLogin, (req, res) => {
    reservData.findByIdAndUpdate(req.params.id, {pending: false})
    .then(result => {
        res.redirect('/display');
    });
});

// Gets the pricing.html from server and loads it to browser
app.get("/pricing", ensureLogin, (req, res) => {
    res.render('pricing');
});

// Gets the contact-us.html from server and loads it to browser
app.get("/contact-us", ensureLogin, (req, res) => {
    res.render('contact-us');
});

// redirect path to /contact-us 
app.get("/contact", ensureLogin, (req, res) => {
    res.redirect('/contact-us');
});

// Gets the login.html from server and loads it to browser
app.get('/login', (req, res) => {
    res.render('login');
});

app.post('/login', (req, res) => { 
    // Find user existing user using username
    User.find({
        username: req.body.username
    }).exec()
    .then((userdatas) => {
        if(userdatas) { // If userdatas is not empty
            // Compare encrypted password with password inputted by user
            bcrypt.compare(req.body.password, userdatas[0].password)
            .then((result) => {
                if (result == false) {  // Check if the passwords are differend
                    res.render('login', {passwordErr: "Password Incorrect"}); // Reload login page with error message displayed
                }
                else {
                    // Returns user's username, email, and type to the session
                    req.session.user = {
                        username: userdatas[0].username,
                        email: userdatas[0].email,
                        userType: userdatas[0].accountType
                    }

                    //console.log(req.session.user);

                    res.redirect('/');  // Send user to the main page
                }
            })
        }
    })
    .catch((err) => {
        res.render('login', {usernameErr: "Username Incorrect"}); // Reload page with error message displayed
    })
});

app.get('/logout', (req, res) => {
    req.session.reset();
    res.redirect("/");
});

// Gets the signup.html from server and loads it to browser
app.get('/signup', (req, res) => {
    res.render('signup');
});

// Sends data from browser to server
app.post("/signup", (req, res) => {
    if(req.body.password != req.body.checkPassword) {   // Check if password is the same for re-entered password
        // Outputs password mismatch error
        console.log("Passwords Do Not Match");
        res.render('signup');
    }
    else {
        // Generates salt for Hashing password
        bcrypt.genSalt(12, function(err, salt){
            // Hash password
            bcrypt.hash(req.body.password, salt, function(err, hash) {
                // Check for errors while hashing password
                if(err) {
                    // Reject and send error message
                    console.log("There was an error encrypting the password");
                }
                else {
                    // Create the new user and saves form data to the object
                    let newUser = new User({
                        username: req.body.username,
                        email: req.body.email,
                        password: hash,         // Set password as hashed password (NEVER STORE UNHASHED PASSWORDS)
                        accountType: "customer" // Set account type to Customer (ONLY CUSTOMERS WOULD NEED TO CREATE A NEW ACCOUNT)
                    });

                    // Attempts to save user into DB
                    newUser.save((err)=> {
                        // Check for errors while saving new user
                        if(err) {
                            // Check for error code 11000, unique key viloations
                            if(err.code == 11000){
                                res.render("signup", {userMessage: "Username taken"});
                            }
                            
                            // Reject and output error message when a different error has occured
                            console.log(`There was an error creating user: ${err}`);
                        }
                        else {
                            // Output success message
                            console.log("User Successfully Saved");

                            /*// Locate new user
                            User.find({
                                username: req.body.username
                            }).exec()
                            .then((userdatas) => {  // Get userdata
                                if(userdatas) { // Check if userdata is not empty
                                    const accountT = "customer" // Make account type a string labelled "Customer"

                                    // Create new accountData
                                    let newAccount = new accountData({
                                        userID: userdatas[0]._id.toString(),    // Convert the userdata's ObjectID into a string and pass as reference
                                        username: userdatas[0].username,
                                        accountType: accountT   // Set account Type
                                    });

                                    newAccount.save((err) => {  // Attempt to save new Account
                                        if(err) {   // Check for errors
                                            // Output error message to console
                                            console.log(`Error: "${err}" found while saving account`); 
                                        }
                                        else { 
                                            // Output success message to console
                                            console.log(`Account Successfully Saved`);
                                            // Output newAccount data object
                                            console.log(newAccount);
                                        }
                                    });
                                }
                            }).catch(err => {   // Catch errors while searching for account
                                // Output error message to console
                                console.log(`Error: "${err}" found while creating account`);
                            });
                            */

                            // Outputs user object
                            console.log(newUser);

                            // Redirect user to login page
                            res.redirect("/login");
                        };
                    });
                };
            });
        });
    };  // END OF SIGNUP FUNCTIONITLY (SAVING NEW USER)
});

// Catch all for incorrect path names
app.use((req, res) => {
    res.status(404).send('<h1>404 Error Page Not Found</h1>');
});

