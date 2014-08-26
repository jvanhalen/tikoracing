Map = function(game) {
	this.game = game;
	this.checkpoint = [];
	this.checkpointPassed = [];
};

Map.prototype = {
	
	create: function() {
		this.map = this.game.add.tilemap('tilemap');
		this.map.addTilesetImage('tiles3');
		
		// create layers
		this.hiddenLayer = this.map.createLayer('Hidden Layer');
		this.hiddenLayer.visible = false;
		this.sandLayer = this.map.createLayer('Sand Layer');
		this.trackLayer = this.map.createLayer('Track Layer');
		this.sandLayer.resizeWorld(); // resize the world bounds to match the layer size
		
		// setup tire skids stuff
		this.texture = this.game.add.renderTexture('tireskids', 1600, 1200);
		this.game.add.sprite(0, 0, this.texture);
		this.skid = this.game.add.sprite(0, 0, 'skid');
		this.skidIce = this.game.add.sprite(0, 0, 'skidice');
		this.skid.visible = false;
		this.skidIce.visible = false;
		this.skid.anchor.setTo(0.5, 0.5);
		this.skidIce.anchor.setTo(0.5, 0.5);
		
		// setup goal line
		this.goalLine = new Phaser.Rectangle(779, 0, 2, 160);
		
		
		// add checkpoints that are used to check if lap is valid
		this.checkpoint[0] = new Phaser.Rectangle(160, 1000, 40, 200);
		this.checkpoint[1] = new Phaser.Rectangle(440, 280, 40, 120);
		this.checkpoint[2] = new Phaser.Rectangle(1280, 720, 160, 40);
		this.checkpoint[3] = new Phaser.Rectangle(320, 960, 160, 40);
		this.checkpoint[4] = new Phaser.Rectangle(1440, 920, 160, 40);
		
		// set checkpoint passes to false
		for (var i=0; i<this.checkpoint.length; i++)
			this.checkpointPassed[i] = false;
	},
	
	update: function() {
		// update checkpoint positions related to camera
		this.goalLine.x = 779 - this.game.camera.x;
		this.goalLine.y = 0 - this.game.camera.y;
		this.checkpoint[0].x = 160 - this.game.camera.x;
		this.checkpoint[0].y = 1000 - this.game.camera.y;
		this.checkpoint[1].x = 440 - this.game.camera.x;
		this.checkpoint[1].y = 280 - this.game.camera.y;
		this.checkpoint[2].x = 1280 - this.game.camera.x;
		this.checkpoint[2].y = 720 - this.game.camera.y;
		this.checkpoint[3].x = 320 - this.game.camera.x;
		this.checkpoint[3].y = 960 - this.game.camera.y;
		this.checkpoint[4].x = 1440 - this.game.camera.x;
		this.checkpoint[4].y = 920 - this.game.camera.y;
	}
};