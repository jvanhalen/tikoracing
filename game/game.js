Racing.Game = function (game) {
	this.game = game;
};

Racing.Game.prototype = {
	
	create: function() {
		this.raceLaps = 2;
		this.lapsDriven = 0;
		raceStartCounter = 3;
		raceOver = false;
		
		var players = this.playerList;

		playersReady = false;
		car = [];
		driversFinished = [];
		this.cursors = this.game.input.keyboard.createCursorKeys(); // setup cursor keys for movement
		this.spacebar = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);

		// create the game map
		this.map = new Map(this.game);
		this.map.create();
		
		// setup checkpoint visits to false
		this.checkpointPassed = [];
		for (var i=0; i<this.map.checkpoint.length; i++)
			this.checkpointPassed[i] = false;
		
		// set some collisions and tile callbacks
		this.map.map.setTileIndexCallback([192, 193, 194, 195, 196, 197, 198, 211, 212, 213, 214, 215,
									216, 217, 218, 219, 231, 232, 233, 234, 235, 236, 237, 238,
									239, 251, 252, 253, 257, 258, 259, 271, 272, 273, 277, 278,
									279, 291, 292, 293, 297, 298, 299, 311, 312, 313, 314, 315,
									316, 317, 318, 319, 331, 332, 333, 334, 335, 336, 337, 338,
									339, 352, 353, 354, 355, 356, 357, 358], this.onIce, this, this.map.trackLayer);
		this.map.map.setTileIndexCallback([10], this.outOfTrack, this, this.map.hiddenLayer);
		this.map.map.setCollision([11, 12, 13, 14, 15, 31, 32, 33, 34, 35, 51, 52, 53, 54, 55], true, this.map.trackLayer);
		this.map.map.setCollision([30, 72, 73, 92, 93], true, this.map.sandLayer);
		
		
		// create the game hud
		hud = new Hud(this.game);
		hud.create(this.playerList, this.raceLaps);
		
		
		
		// create cars
		playerIndex = this.playerList.indexOf(this.playerName);
		for (var i=0; i<this.playerList.length; i++) {
			if (i == playerIndex) {
				car[i] = new Car(this.game);
				car[i].create('basiccar');
			}
			else {
				car[i] = new Car(this.game);
				car[i].create('basiccar_blue');
			}
			
			switch(i) {
				case 0:
					car[i].sprite.angle = -180;
					car[i].sprite.x = 810;
					car[i].sprite.y = 120;
					break;
				case 1:
					car[i].sprite.angle = -180;
					car[i].sprite.x = 830;
					car[i].sprite.y = 80;
					break;
				case 2:
					car[i].sprite.angle = -180;
					car[i].sprite.x = 870;
					car[i].sprite.y = 120;
					break;
				case 3:
					car[i].sprite.angle = -180;
					car[i].sprite.x = 890;
					car[i].sprite.y = 80;
					break;
			}
		}
		
		// create goal
		this.game.add.sprite(760, 15, 'goalpoles');
		this.game.add.sprite(760, 30, 'goaltop');
		
		// make the camera follow player
		this.game.camera.follow(car[playerIndex].sprite);
		
		this.skid = this.game.add.sprite(0, 0, 'skid');
		this.skidIce = this.game.add.sprite(0, 0, 'skidice');
		this.skid.visible = false;
		this.skidIce.visible = false;
		this.skid.anchor.setTo(0.5, 0.5);
		this.skidIce.anchor.setTo(0.5, 0.5);
		
		// Create emitters
		this.initEmitters();
		
		// when all players ready, start countdown to race
		// done this way for easy listener removal, when
		// going into game with less players than earlier
		var updatePlayerReady = function(index) {
			car[index].readyToPlay = true;
			for (var i=0; i<players.length; i++) {
				if (!car[i].readyToPlay) {
					playersReady = false;
					break;
				}
				playersReady = true;
			}
			if (playersReady)
				socket.emit('game start counter');
		};
		socket.on('update player ready', updatePlayerReady);
		
		// update race results
		var updateResults = function(data) {
			driversFinished.push(data);
				
			if (car[playerIndex].playerFinished)
				for (var i=0; i<driversFinished.length; i++) {
					hud.resultsText[i].setText((i+1) + '. ' + driversFinished[i]);
					hud.resultsTextContainer[i].visible = true;
				}
			if (driversFinished.length == players.length) {
				setTimeout(function() {
					socket.removeListener('update results', updateResults);
					socket.removeListener('update player ready', updatePlayerReady);
					socket.emit('race end');
					clearInterval(hud.pingInterval);
					raceOver = true;
				}, 3000);
			}
		};
	socket.on('update results', updateResults);
	
	socket.on('update opponents', function(data) {
		car[data.index].sprite.x = data.x;
		car[data.index].sprite.y = data.y;
		car[data.index].sprite.rotation = data.rot;
		car[data.index].sprite.body.acceleration.copyFrom(data.acc);
		car[data.index].sprite.body.velocity.copyFrom(data.vel);
	});
	
	this.packetsPerSecond = 30; // how many packets sent per second
	this.packetCounter = 0; // help to count packet sending intervals
		//socket.emit('race end');
		//this.game.state.start('Main');
	},
	
	update: function () {
		// Run loop until players ready
		if (!playersReady) {
			if (this.spacebar.isDown && !car[playerIndex].readyToPlay) {
				//if (hud.readyToPlayText) {
					//hud.readyToPlayText.destroy();
					//hud.readyToPlayText = null;
					hud.readyToPlayText.content = "";
					socket.emit('player ready', playerIndex);
				//}
			}
		}
		else if (raceStartCounter > 0) {
			socket.on('update start counter', function(data) {
				raceStartCounter = data;
				hud.readyToPlayText.content = data;
				if (data === 0) {
					hud.readyToPlayText.content = '';
				}
			});
		}
		
////////////////////////////////////////////////////////////// MAIN GAME LOOP ///////////////////////////////////////////////////////////////////////
		else {
			this.dt = this.game.time.physicsElapsed; // time elapsed since last physics calculation
			this.carSpeed = car[playerIndex].sprite.body.velocity.getMagnitude();
			this.drag = this.carSpeed*car[playerIndex].dragC; // set the drag for acceleration
			
			// send car data
			if (this.packetCounter === 0)
				this.packetCounter = this.game.time.time;
			if (this.game.time.time - this.packetCounter >= 1000 / this.packetsPerSecond) {
				this.packetCounter  = this.game.time.time;
				socket.emit('car data', {x: car[playerIndex].sprite.x, y: car[playerIndex].sprite.y,
									index: playerIndex, rot: car[playerIndex].sprite.rotation,
									acc: car[playerIndex].sprite.body.acceleration,
									vel: car[playerIndex].sprite.body.velocity, pps: this.packetsPerSecond});
			}
			
			this.getInput();
			
			// calculations for forward and lateral velocities
			//car[playerIndex].carForward = [Math.cos(car[playerIndex].sprite.body.rotation*Math.PI/180), Math.sin(car[playerIndex].sprite.body.rotation*Math.PI/180)];
			car[playerIndex].carForward = new Phaser.Point (Math.cos(car[playerIndex].sprite.body.rotation*Math.PI/180), Math.sin(car[playerIndex].sprite.body.rotation*Math.PI/180));
			//car[playerIndex].carRight = [Math.cos((car[playerIndex].sprite.body.rotation+90)*Math.PI/180), Math.sin((car[playerIndex].sprite.body.rotation+90)*Math.PI/180)];
			car[playerIndex].carRight = new Phaser.Point (Math.cos((car[playerIndex].sprite.body.rotation+90)*Math.PI/180), Math.sin((car[playerIndex].sprite.body.rotation+90)*Math.PI/180));
			car[playerIndex].dotProductFwd = car[playerIndex].sprite.body.velocity.x*car[playerIndex].carForward.x + car[playerIndex].sprite.body.velocity.y*car[playerIndex].carForward.y;
			car[playerIndex].dotProductRight = car[playerIndex].sprite.body.velocity.x*car[playerIndex].carRight.x + car[playerIndex].sprite.body.velocity.y*car[playerIndex].carRight.y;
			car[playerIndex].fwdVelocity = new Phaser.Point(car[playerIndex].carForward.x*car[playerIndex].dotProductFwd, car[playerIndex].carForward.y*car[playerIndex].dotProductFwd);
			car[playerIndex].lateralVelocity = new Phaser.Point(car[playerIndex].carRight.x*car[playerIndex].dotProductRight, car[playerIndex].carRight.y*car[playerIndex].dotProductRight);
					
			// kill some of the lateral velocity, depending on the drift value
			car[playerIndex].sprite.body.velocity.x = car[playerIndex].fwdVelocity.x + car[playerIndex].lateralVelocity.x*car[playerIndex].drift;
			car[playerIndex].sprite.body.velocity.y = car[playerIndex].fwdVelocity.y + car[playerIndex].lateralVelocity.y*car[playerIndex].drift;
			
			// if enough lateral velocity, draw skids
			if (car[playerIndex].lateralVelocity.getMagnitude() / this.carSpeed > 0.5) {
				this.drawSkid();
			}
			
			if (this.lapsDriven < this.raceLaps) {
				//this.controls.update(car[playerIndex], this.drag);
			}
			else {
				car[playerIndex].sprite.body.acceleration.setTo(0, 0);
			}
			
			// set the basic values for car
			car[playerIndex].power = car[playerIndex].basePower;
			car[playerIndex].dragC = car[playerIndex].baseDragC;
			car[playerIndex].drift = car[playerIndex].baseDrift;
			car[playerIndex].sprite.body.angularDrag = car[playerIndex].baseAngularDrag;
			this.carOnIce = false;
			
			// setup collides
			
			this.game.physics.collide(car[playerIndex].sprite, this.map.trackLayer);
			this.game.physics.collide(car[playerIndex].sprite, this.map.sandLayer);
			this.game.physics.collide(car[playerIndex].sprite, this.map.hiddenLayer);
			
			this.map.update();
			// check if car touching checkpoints
			if (this.map.checkpoint.length > 0) {
				if (Phaser.Rectangle.intersects(car[playerIndex].sprite.bounds, this.map.checkpoint[0]))
					this.checkpointPassed[0] = true;
				for (var i=1; i<this.map.checkpoint.length; i++) {
					if (Phaser.Rectangle.intersects(car[playerIndex].sprite.bounds, this.map.checkpoint[i]) && this.checkpointPassed[i-1])
						this.checkpointPassed[i] = true;
				}
			}
			
			// check if car touches goal line and if true, check if lap is valid
			if (Phaser.Rectangle.intersects(car[playerIndex].sprite.bounds, this.map.goalLine)) {
				
				if (this.checkLap()) {
					this.lapsDriven += 1;
					if (this.lapsDriven == this.raceLaps) {
						car[playerIndex].playerFinished = true;
						socket.emit('player finished', this.playerName);
					}
					else
						hud.lapText.setText('Lap ' + (this.lapsDriven + 1) + ' / ' + this.raceLaps);
					for (var i=0; i<this.checkpointPassed.length; i++)
						this.checkpointPassed[i] = false;
				}
			}
			
			if (raceOver) this.game.state.start('Main');
		}
	},
	
	// debug draw (for canvas)
	render: function() {
		
		//for (var i=0; i<this.map.checkpoint.length; i++)
			//this.game.debug.renderRectangle(this.map.checkpoint[i], "white");
		//this.game.debug.renderRectangle(goalLine, "yellow");
		
	},
	
	initEmitters: function() {
		// smoke particles
		this.smokeEmitter = this.game.add.emitter(0, 0, 1000);
		this.smokeEmitter.makeParticles('smokeparticle');
		this.smokeEmitter.lifespan = 1000;
		this.smokeEmitter.gravity = 0;
		// snow particles
		this.snowEmitter = this.game.add.emitter(0, 0, 1000);
		this.snowEmitter.makeParticles('snowparticle');
		this.snowEmitter.lifespan = 1000;
		this.snowEmitter.gravity = 0;
	},
	
	// draw tire skid marks
	drawSkid: function() {
		// calculate rear tire positions (for skid marks & smoke)
		car[playerIndex].tireLR.x = car[playerIndex].sprite.x - Math.cos(car[playerIndex].sprite.body.rotation*Math.PI/180)*car[playerIndex].sprite.width/2*0.6 + Math.sin(car[playerIndex].sprite.body.rotation*Math.PI/180)*car[playerIndex].sprite.height/2*0.6;
		car[playerIndex].tireLR.y = car[playerIndex].sprite.y - Math.sin(car[playerIndex].sprite.body.rotation*Math.PI/180)*car[playerIndex].sprite.width/2*0.6 - Math.cos(car[playerIndex].sprite.body.rotation*Math.PI/180)*car[playerIndex].sprite.height/2*0.6;
		car[playerIndex].tireRR.x = car[playerIndex].sprite.x - Math.cos(car[playerIndex].sprite.body.rotation*Math.PI/180)*car[playerIndex].sprite.width/2*0.6 - Math.sin(car[playerIndex].sprite.body.rotation*Math.PI/180)*car[playerIndex].sprite.height/2*0.6;
		car[playerIndex].tireRR.y = car[playerIndex].sprite.y - Math.sin(car[playerIndex].sprite.body.rotation*Math.PI/180)*car[playerIndex].sprite.width/2*0.6 + Math.cos(car[playerIndex].sprite.body.rotation*Math.PI/180)*car[playerIndex].sprite.height/2*0.6;
		
		if (!this.carOnIce) {
			this.smokeEmitter.x = car[playerIndex].tireLR.x;
			this.smokeEmitter.y = car[playerIndex].tireLR.y;
			this.smokeEmitter.emitParticle();
			//socket.emit('send smoke', {x: smokeEmitter.x, y: smokeEmitter.y});
			this.smokeEmitter.x = car[playerIndex].tireRR.x;
			this.smokeEmitter.y = car[playerIndex].tireRR.y;
			this.smokeEmitter.emitParticle();
			//socket.emit('send smoke', {x: smokeEmitter.x, y: smokeEmitter.y});
			this.map.texture.render(this.skid, new Phaser.Point(car[playerIndex].tireLR.x, car[playerIndex].tireLR.y), false, true);
			this.map.texture.render(this.skid, new Phaser.Point(car[playerIndex].tireRR.x, car[playerIndex].tireRR.y), false, true);
		}
		else {
			this.snowEmitter.x = car[playerIndex].tireLR.x;
			this.snowEmitter.y = car[playerIndex].tireLR.y;
			this.snowEmitter.emitParticle();
			this.snowEmitter.x = car[playerIndex].tireRR.x;
			this.snowEmitter.y = car[playerIndex].tireRR.y;
			this.snowEmitter.emitParticle();
			this.map.texture.render(this.skidIce, new Phaser.Point(car[playerIndex].tireLR.x, car[playerIndex].tireLR.y), false, true);
			this.map.texture.render(this.skidIce, new Phaser.Point(car[playerIndex].tireRR.x, car[playerIndex].tireRR.y), false, true);
		}	
	},
	
	outOfTrack: function() {
		car[playerIndex].power = car[playerIndex].basePower;
		car[playerIndex].dragC = car[playerIndex].baseDragC*4;
		car[playerIndex].drift = car[playerIndex].baseDrift;
		car[playerIndex].sprite.body.angularDrag = car[playerIndex].baseAngularDrag;
	},

	onIce: function() {
		car[playerIndex].power = car[playerIndex].basePower/2;
		car[playerIndex].dragC = car[playerIndex].baseDragC/2;
		car[playerIndex].drift = car[playerIndex].baseDrift+0.04;
		car[playerIndex].sprite.body.angularDrag = car[playerIndex].baseAngularDrag/2;
		this.carOnIce = true;
	},
	
	// to check if all checkpoints visited
	checkLap: function() {
		var lapComplete = false;
		for (var i=0; i<this.checkpointPassed.length; i++) {
			if (this.checkpointPassed[i] == true)
				this.lapComplete = true;
			else
				this.lapComplete = false;
		}
		return this.lapComplete;
	},
	
	getInput: function() {
		if (this.cursors.up.isDown) {
			// at low speeds draw skids when accelerating
				if (this.carSpeed < car[playerIndex].basePower*0.5 && car[playerIndex].lateralVelocity.getMagnitude() / this.carSpeed <= 0.5 ) {
					this.drawSkid();
				}
				//game.physics.accelerationFromRotation(car[playerIndex].sprite.body.rotation*Math.PI/180, car[playerIndex].power-drag, car[playerIndex].sprite.body.acceleration);
				car[playerIndex].sprite.body.acceleration.x = Math.cos(car[playerIndex].sprite.body.rotation*Math.PI/180)*(car[playerIndex].power-this.drag)*this.dt*60;
				car[playerIndex].sprite.body.acceleration.y = Math.sin(car[playerIndex].sprite.body.rotation*Math.PI/180)*(car[playerIndex].power-this.drag)*this.dt*60;
				car[playerIndex].sprite.body.linearDamping = 4;
			}
			else if (this.cursors.down.isDown) {
				if (this.carSpeed > 0)
					this.drawSkid();
					car[playerIndex].sprite.body.acceleration.setTo(0, 0);
					if (this.carOnIce)
						car[playerIndex].sprite.body.linearDamping = 6;
					else
						car[playerIndex].sprite.body.linearDamping = 8;
			}
			else {
				car[playerIndex].sprite.body.acceleration.setTo(0, 0);
				car[playerIndex].sprite.body.linearDamping = 4;
			}
			
			if (this.cursors.right.isDown) {
				car[playerIndex].sprite.body.angularVelocity += car[playerIndex].turnSpeed*this.dt*60;
			}
			else if (this.cursors.left.isDown) {
				car[playerIndex].sprite.body.angularVelocity -= car[playerIndex].turnSpeed*this.dt*60;
			}
	}
	
	

};