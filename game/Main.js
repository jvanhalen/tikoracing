Racing.Main = function (game) {
	this.game = game;
};

Racing.Main.prototype = {
	
	create: function() {
		this.background = this.add.sprite(0, 0, 'mainmenubg');
	}
};