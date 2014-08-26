module.exports = function(io) {
	var nicknames = [];
	var waitingList = [];
	var gameRooms = [];
	var waitInterval;
	
	io.sockets.on('connection', function(socket) {
	
		// if sent message received...
		socket.on('send message', function(data) {
			// ...send message back to clients
			io.sockets.in('chatRoom').emit('new message', data);
			//io.sockets.emit('new message', {msg: data, nick: socket.nickname});
		});
		
		// when client connects
		socket.on('new user', function(data) {
			// if user doesn't already exist, add to userlist
			//if (nicknames.indexOf(data) != -1) return;
			socket.nickname = data;
			socket.room = 'chatRoom';
			socket.join('chatRoom');
			nicknames.push(socket.nickname);
			io.sockets.emit('usernames', nicknames);
			io.sockets.emit('waiternames', waitingList);
		});
		
		// join/leave waiting list
		socket.on('new waiter', function(data) {
			if (waitingList.indexOf(data) != -1) {
				waitingList.splice(waitingList.indexOf(socket.nickname), 1);
				socket.leave('waitRoom');
				io.sockets.emit('waiternames', waitingList);
				if (waitingList.length == 0) {
					io.sockets.emit('counter', '');
					clearInterval(waitInterval);
				}
			}
			
			// players driving already can't join new race
			else if (socket.room == 'chatRoom') {
				if (waitingList.length == 0) {
					var counter = 3;
					io.sockets.emit('counter', counter);
					waitInterval = setInterval( function(){
						--counter;
						io.sockets.emit('counter', counter);
						if (counter == 0) {
							io.sockets.in('waitRoom').emit('launchgame', waitingList);
							
							do {
								var room = 'gameRoom' + Math.floor((Math.random()*1000)+1);
							} while (gameRooms.indexOf(room) != -1);
							gameRooms.push(room);
							
							var list = io.sockets.clients('waitRoom');
							list.forEach(function(client) {
								waitingList.splice(waitingList.indexOf(client.nickname), 1);
								client.leave('waitRoom');
								client.join(room);
								client.room = room;
							});
							
							io.sockets.emit('waiternames', waitingList);
							io.sockets.emit('counter', '');
							clearInterval(waitInterval);
						}
					}, 1000);
				}
				waitingList.push(data);
				socket.join('waitRoom');
				io.sockets.emit('waiternames', waitingList);
			}
		});
		
		// if user disconnects, delete name from participants array
		socket.on('disconnect', function(data) {
			if (!socket.nickname) return;
			if (waitingList.indexOf(socket.nickname) != -1) {
				waitingList.splice(waitingList.indexOf(socket.nickname), 1);
				if (waitingList.length == 0) {
					io.sockets.emit('counter', '');
					clearInterval(waitInterval);
				}
			}
			nicknames.splice(nicknames.indexOf(socket.nickname), 1);
			io.sockets.emit('usernames', nicknames);
			io.sockets.emit('waiternames', waitingList);
		});
		
		// broadcast car data to other clients in the same room
		socket.on('car data', function(data) {
			socket.broadcast.in(socket.room).emit('update opponents', data);
		});
		
		// player ready to start the race
		socket.on('player ready', function(index) {
			io.sockets.in(socket.room).emit('update player ready', index);
		});
		
		// countdown to start the race, when all players ready
		socket.on('game start counter', function() {
			var counter = 3;
			io.sockets.in(socket.room).emit('update start counter', counter);
			var interval = setInterval (function(){
				--counter;
				io.sockets.in(socket.room).emit('update start counter', counter);
				if (counter == 0) {
					clearInterval(interval);
				}
			}, 1000);
		});
		
		socket.on('ping', function(time) {
			socket.emit('latency', time);
		});
		
		// called, when race has ended
		socket.on('race end', function() {
			if (gameRooms.indexOf(socket.room) != -1)
				gameRooms.splice(gameRooms.indexOf(socket.room), 1);
			socket.leave(socket.room);
			socket.room = 'chatRoom';
			
		});
		
		// player driven all the laps
		socket.on('player finished', function(data) {
			io.sockets.in(socket.room).emit('update results', data);
		});

		/*
		socket.on('send smoke', function(emitter) {
			socket.broadcast.in(socket.room).emit('draw smoke', emitter);
		});*/
	});
};