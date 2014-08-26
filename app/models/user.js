var mongoose	= require('mongoose');
var bcrypt		= require('bcrypt-nodejs');

// define the user schema
var userSchema = mongoose.Schema({
	local	: {
		username	: String,
		password	: String
	}
});

// generate a hash
userSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// check if password is valid
userSchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.local.password);
};

// check if password is valid
userSchema.methods.addNewUser = function(username, password) {

	var User = mongoose.model('User', userSchema);
	var user = new User({ local: {username: username, password: this.methods.generateHash(password)}});

	user.save(function (err) {

		if (err) {
			console.log("got some mysterious mongodb error:", err);
			return handleError(err);
		}
		// saved!
		console.log("new user added!");
	})
};

// create the model for users and expose it to the app
module.exports = mongoose.model('User', userSchema);
