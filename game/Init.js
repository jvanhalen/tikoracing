Racing = {};

Racing.Init = function (game) {

};

Racing.Init.prototype = {

	preload: function () {
		this.load.bitmapFont('font', 'assets/font.png', 'assets/font.fnt');
		this.load.image('smokeparticle', '/assets/smokeparticle.png');
		this.load.image('mainmenubg', '/assets/mainmenubg.png');
		this.load.image('snowparticle', '/assets/snowparticle.png');
		this.load.image('skid', '/assets/skid.png');
		this.load.image('skidice', '/assets/skidice.png');
		this.load.tilemap('tilemap', '/assets/testtrack.json', null, Phaser.Tilemap.TILED_JSON);
		this.load.image('tiles3', 'assets/tiles3.png');
		this.load.image('basiccar', 'assets/basiccar.png');
		this.load.image('basiccar_blue', 'assets/basiccar_blue.png');
		this.load.image('fullscreenbutton', 'assets/fullscreen.png');
		this.load.image('goaltop', 'assets/goal.png');
		this.load.image('goalpoles', 'assets/goal2.png');
		this.progressText = this.add.text(50, 50, 'Loading... ', { font: '32px arial', fill: '#FFF' });
		this.load.onFileComplete.add(this.updateProgress, this);
	},
	
	create: function() {
		this.game.stage.fullScreenScaleMode = Phaser.StageScaleMode.SHOW_ALL;
		this.game.stage.disableVisibilityChange = true; // game is not paused if not focused
		this.game.state.start('Main');
	},
	
	updateProgress: function() {
		this.progressText.content = "Loading... " + this.load.progress + "%";
	}
};