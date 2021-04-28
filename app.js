const path = require("path");
const bodyParser = require("body-parser");
const clientSessions = require ("client-sessions");
const bcrypt = require("bcryptjs");
const exphbs = require("express-handlebars");

//const auth = require("./js/auth");
const UserData = require('./public/js/model/user');
const reservData = require('./public/js/model/reservation');

const mongoose = require("mongoose");
const dbURI = "mongodb+srv://PRJ666Admin:PRJ666-Password@prj666-cluster.n7led.mongodb.net/PRJ666DB?retryWrites=true&w=majority";
mongoose.connect(dbURI, {useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true})
.then((result) => {
    console.log("Connected to Mongo Database");
    app.listen(8080);
})
.catch((err) => {
    console.log(`Error ${err} found`);
});

const express = require("express");
// Create express app
const app = express();

let errMsg = "";

// Create new view engine
 app.engine('.hbs', exphbs({
     extname: '.hbs',
     defaultLayout: ''
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
        duration: 3 * 60 * 1000,
        activeDuration: 1000 * 60
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
app.get("/", (req, res) => {
    res.render('index');
});


// Gets the about-us.html from server and loads it to browser
app.get("/about-us", (req, res) => {
    res.render('about-us');
});

// redirects path to about-us path
app.get("/about", (req, res) => {
    res.redirect('/about-us');
});

// Gets the menu.html from server and loads it to browser
app.get("/menu", (req, res) => {
    res.render('menu');
});

//Gets staffReservation
app.get("/staff", (req, res) => {
    res.render('staff');
});

// Gets the reservation.html from server and loads it to browser
app.get("/reservation", (req, res) => {
    res.render('reservation');
});

app.post("/reservation", ensureLogin, (req, res) => {
    let today = new Date(); // Gets todays date and time

    if (req.body.bookFor <= today) {    // Check if the date and time is today or in the past
        errMsg = "Date and time unavailable";   // Change error message
        res.render("reservation", {message: errMsg});   // Reloads page with error message displayed
    } 
    else {
        console.log(req.body.location);
        
        // Make new Reservation object
        let newReserv = new reservData({
            username: req.session.user.username,
            name: req.body.name,
            email: req.body.email,
            phone: req.body.phone,
            bookFor: req.body.bookFor,
            custCount: req.body.custCount,
            location: req.body.location,
            note: req.body.note
        });

        console.log(newReserv);
        
        // Attempts to save object into database
        newReserv.save((err) => {
            if (err) {
                // Outputs error message
                console.log(`Error: ${err}, occurred while saving new Reservation`);
            }
            else { 
                // Outputs success message
                console.log("Reservation Sucessfully Made");
            }
        });

        // Finds the new reservation
        reservData.find({
            username: req.session.user.username,
            name: req.body.name,
            email: req.body.email,
            phone: req.body.phone,
            bookFor: req.body.bookFor,
            custCount: req.body.custCount,
            location: req.body.location,
            note: req.body.note
        }).sort({timestamp: 'ascending'})   // Sorts it so the newest reservation is at the top
        .exec()
        .then(reservs => {
            // If the reservations array is not empty
            if(reservs) {
                //console.log(reservs);
                res.redirect(`/display`);
                //res.redirect(`/display/${reservs[0]._id}`); // Redirect the user to display page using ID
            }
        })
    }
});

// Gets display and pass id params
app.get("/display", (req, res) => {
    const id = req.params.id;   // Saves id params
    //console.log(`ID param: ${id}`);
    res.render("display");  // Render display page
});
// app.get("/display/:id", (req, res) => {
//     const id = req.params.id;   // Saves id params
//     //console.log(`ID param: ${id}`);
//     res.render("display");  // Render display page
// });

// Gets the pricing.html from server and loads it to browser
app.get("/pricing", (req, res) => {
    res.render('pricing');
});

// Gets the contact-us.html from server and loads it to browser
app.get("/contact-us", (req, res) => {
    res.render('contact-us');
});

// redirect path to /contact-us 
app.get("/contact", (req, res) => {
    res.redirect('/contact-us');
});

// Gets the login.html from server and loads it to browser
app.get('/login', (req, res) => {
    errMsg = "";
    res.render('login', {message: errMsg});
});

app.post('/login', (req, res) => { 
    // Find user existing user using username
    UserData.findOne({
        username: req.body.username
    }).exec()
    .then((userdatas) => {
        if(userdatas) { // If userdatas is not empty
            // Compare encrypted password with password inputted by user
            bcrypt.compare(req.body.password, userdatas.password)
            .then((result) => {
                if (result == false) {  // Check if the passwords are differend
                    errMsg = "Password Incorrect";  // Set message to be display password is incorrect
                    res.render('login', {message: errMsg}); // Reload login page with error message displayed
                }
                else {
                    errMsg = "";    // Remove error message

                    // Returns user's username, email, and type to the session
                    req.session.user = {
                        username: userdatas.username,
                        email: userdatas.email,
                        userType: userdatas.userType
                    }

                    res.redirect('/');  // Send user to the main page
                }
            })
        }
    })
    .catch((err) => {
        // Set error message
        errMsg = "Username Incorrect";
        res.render('login', {message: errMsg}); // Reload page with error message displayed
    })
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
                    // // Set password as hashed password (NEVER STORE UNHASHED PASSWORDS)
                    // req.body.password = hash;

                    // Create the new user and saves form data to the object
                    let newUser = new UserData({
                        username: req.body.username,
                        email: req.body.email,
                        password: hash,
                        userType: "customer"
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

