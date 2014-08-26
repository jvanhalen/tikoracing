Car = function(game) {
	this.game = game;
	
	// base values for car
	this.basePower = 600;
	this.baseDragC = 1;
	this.baseAngularDrag = 600;
	this.baseDrift = 0.95;
	
	this.tireLR =  new(Phaser.Point);
	this.tireRR = new(Phaser.Point);
	this.lateralVelocity = new(Phaser.Point);
	
};

Car.prototype = {

	create: function(type) {
		this.power = this.basePower;
		this.dragC = this.baseDragC;
		this.drift = this.baseDrift;
		this.turnSpeed = 17;
		this.sprite = this.game.add.sprite(0, 0, type);
		this.sprite.anchor.setTo(0.5, 0.5); // set anchor point to center of sprite
		this.sprite.body.bounce.setTo(0.5, 0.5); // bounciness
		this.sprite.body.collideWorldBounds = true;
		this.sprite.body.maxAngular = 140;
		this.sprite.body.linearDamping = 4; // decelerating value when not accelerating
		this.sprite.body.angularDrag = this.baseAngularDrag;
		
		this.readyToPlay = false;
		this.playerFinished = false;
		//this.driverName = playerName;
		this.lastLap = 0;
	}
	
	
};