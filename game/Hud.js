Hud = function(game, playerList) {
	this.game = game;
	
};

Hud.prototype = {

	create: function(playerList, raceLaps) {
		
		this.readyToPlayText = this.game.add.text(20, 300, 'Press space when ready to play', { font: '48px arial', fill: '#FFF' });
		this.readyToPlayText.fixedToCamera = true;
		
		// button to go to full screen
		this.fullScreenButton = this.game.add.button(700, 10, 'fullscreenbutton', this.fullScreen, this);
		this.fullScreenButton.fixedToCamera = true;
		
		
		
		// text for lap calculations
		this.lapText = this.game.add.bitmapText(0, 0, 'Lap 1' + ' / ' + raceLaps, { font: '32px Arial', align: 'center' });
		this.lapTextContainer = this.game.add.sprite(10, 30, null);
		this.lapTextContainer.addChild(this.lapText);
		this.lapTextContainer.fixedToCamera = true;
		
		// drivers text
		var text = "";
		for (var i=0; i<playerList.length; i++) {
			text += (playerList[i] + ' - ' + 0 + '   ');
		}
		this.driverText = this.game.add.bitmapText(0, 0, text, { font: '20px Arial', align: 'center' });
		// Use container sprite to make the bitmap text fixed to camera
		this.driverTextContainer = this.game.add.sprite(10, 570, null);
		this.driverTextContainer.addChild(this.driverText);
		this.driverTextContainer.fixedToCamera = true;
		
		// latency text
		var latencyText = this.game.add.bitmapText(0, 0, '- ms', { font: '20px Arial', align: 'center' });
		this.latencyTextContainer = this.game.add.sprite(10, 10, null);
		this.latencyTextContainer.addChild(latencyText);
		this.latencyTextContainer.fixedToCamera = true;
		
		// text for results
		this.resultsText = [];
		this.resultsTextContainer = [];
		for (var i=0; i<playerList.length; i++) {
			this.resultsText[i] = this.game.add.bitmapText(0, 0, '', { font: '32px Arial', align: 'center' });
			this.resultsTextContainer[i] = this.game.add.sprite(200, 200 + i*50, null);
			this.resultsTextContainer[i].addChild(this.resultsText[i]);
			this.resultsTextContainer[i].fixedToCamera = true;
			this.resultsTextContainer[i].visible = false;
		}
		
		// send current time to server...
		this.pingInterval = setInterval(function() {
			socket.emit('ping', Date.now());
		}, 2000);
		// ...calculate latency
		socket.on('latency', function(time) {
			latencyText.setText(Date.now() - time + ' ms');
		});
	},
	
	// go full screen, if supported by browser
	fullScreen: function() {
		this.game.stage.scale.startFullScreen();
	}
};