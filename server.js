#!/bin/env node

var express		= require('express');
var app 		= express();
var server		= require('http').createServer(app);
var io			= require('socket.io').listen(server);
var ipaddress	= process.env.OPENSHIFT_NODEJS_IP || "127.0.0.1"
var port 		= process.env.OPENSHIFT_NODEJS_PORT || 8080;
var mongoose	= require('mongoose');
var passport	= require('passport');
var flash		= require('connect-flash');
var configDB	= require('./config/database.js');

// app configuration
app.configure(function() {
	app.use(express.logger('dev')); // log requests to the console
	app.set('view engine', 'jade'); // set up jade for templating
	app.use(express.cookieParser()); // for authentication
	app.use(express.urlencoded());
	app.use(express.json());
	app.use(express.static(__dirname + '/game'));
	
	// passport stuff
	app.use(express.session({ secret: 'mysessionsecret' })); // session secret
	app.use(passport.initialize());
	app.use(passport.session()); // persistent login sessions
	app.use(flash()); // use connect-flash for flash messages stored in session
});

io.configure(function(){
    io.set("transports", ["websocket"]);
	io.set('log level', 1);
});

// connect to database
mongoose.connect(configDB.url);

// pass passport for configuration
require('./config/passport')(passport);

// routes
require('./app/routes.js')(app, passport);

// socket.io
require('./app/socket.js')(io);

// launch app
server.listen(port, ipaddress, function() {
	console.log('%s: Node server started on %s%d',
		Date(Date.now()), ipaddress + ":", port);
});