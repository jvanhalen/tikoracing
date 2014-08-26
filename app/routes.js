module.exports = function(app, passport, io) {

	// home page
	app.get('/', function(req, res) {
		res.render('index.jade', { user: req.user });
	});
	
	// login page
	app.get('/login', notLoggedIn, function(req, res) {
		res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
		res.render('login.jade', { message: req.flash('loginMessage') });
	});
	
	// process the login form
	app.post('/login', passport.authenticate('local-login', {
		successRedirect: '/main', // redirect to the home page
		failureRedirect: '/login', // redirect back to the login page if there is an error
		failureFlash: true // allow flash messages
	}));
	
	// logout
	app.get('/logout', function(req, res) {
		req.logout();
		res.redirect('/');
	});
	
	app.get('/main', isLoggedIn, function(req, res) {
		res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
		res.render('main.jade', { user: req.user });
	});
}

// check if user is logged in already
function isLoggedIn(req, res, next) {
	// if user is authenticated in the session, carry on 
	if (req.isAuthenticated())
		return next();
	// if user isn't authenticated, redirect to home page
	res.redirect('/');
}

// check if user is not logged in already
function notLoggedIn(req, res, next) {
	// if user is not authenticated in the session, carry on 
	if (!req.isAuthenticated())
		return next();
	// if user is authenticated, redirect to home page
	res.redirect('/');
}