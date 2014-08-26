var LocalStrategy   = require('passport-local').Strategy;
var User       		= require('../app/models/user');

// expose this function to our app using module.exports
module.exports = function(passport) {

    // =========================================================================
    // passport session setup ==================================================
    // =========================================================================
    // required for persistent login sessions

    // serialize the user for the session
    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    // deserialize the user
    passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
            done(err, user);
        });
    });
	
	// local login
	passport.use('local-login', new LocalStrategy({
        usernameField : 'username',
        passwordField : 'password',
        passReqToCallback : true // allows us to pass back the entire request to the callback
    },
    function(req, username, password, done) { // callback with username and password from our form

		// find a user whose username is the same as the username in form
		// checking to see if the user trying to login already exists
        User.findOne({ 'local.username' :  username }, function(err, user) {
            // if there are any errors, return the error before anything else
            if (err)
                return done(err);
            // if no user is found, return the message
            if (!user) {
                // Dirty hack by JaakkoV
                var newUser = new User({ local: {username: username, password: "test"}});

                newUser.local.password = newUser.generateHash(password)

                newUser.save(function (err) {

                    if (err) {
                        console.log("got some mysterious mongodb error:", err);
                        return handleError(err);
                    }
                    // saved!
                    console.log("new user added!");
                })
                return done(null, false, req.flash('loginMessage', 'User not found - added a new one')); // req.flash is the way to set flashdata using connect-flash
            }
			// if the user is found but the password is wrong
            if (!user.validPassword(password)) {
                return done(null, false, req.flash('loginMessage', 'Wrong password')); // create the loginMessage and save it to session as flashdata
            }
            // all is well, return successful user
            return done(null, user);
        });
    }));
};