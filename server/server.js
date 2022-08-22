const express = require('express');
const app = express();
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
const buildDeck = require('./helpers/buildDeck');
const getSum = require('./helpers/getSum');

require('dotenv').config();

const server = http.createServer(app);
const PORT = process.env.PORT || 3001;

app.use(cors());

const io = new Server(server, {
	cors: {
		origin: 'http://localhost:3000',
	},
});

let gameDecks = {};
let rooms = {};
let users = [];
let playCards = {};
const limit = 3;
let check;

const initialize = () => {};

io.on('connection', (socket) => {
	console.log('This user connected');

	socket.on('joinRoom', ({ user, room }) => {
		if (!rooms[room]) {
			rooms[room] = ['Dealer'];
		}

		if (rooms[room].length === 3) {
			socket.emit('reject', { message: 'Room is full' });
			return;
		} else {
			socket.join(room);
			rooms[room].push(user);
			users.push(socket.id);
			users.push(user);
		}

		if (rooms[room].length === limit) {
			gameDecks[room] = buildDeck();
			check = true;
			io.sockets.to(room).emit('startGame');
		}
	});

	socket.on('initialize', ({ room }) => {
		if (check) {
			let newUsers = rooms[room];
			let newDeck = gameDecks[room];
			playCards[room] = [];

			for (let i = 0; i < newUsers.length; i++) {
				let cards = newDeck.splice(-2);
				playCards[room][i] = {
					name: newUsers[i],
					cards: cards,
					priority: i === 1 ? true : false,
					sum: getSum(cards),
				};
			}
		}

		check = false;
		io.sockets.to(room).emit('initialize', { playCards: playCards[room] });
	});

	socket.on('getCard', ({ room, user }) => {
		let deck = gameDecks[room];
		let newUser = playCards[room].find((obj) => obj.name === user);
		let index = playCards[room].indexOf(newUser);
		newUser.cards.push(deck.pop());
		newUser.sum = getSum(newUser.cards);
		io.sockets.to(room).emit('getCard', { playCards: playCards[room] });
		if (newUser.sum > 21) {
			if (index === playCards[room].length - 1) {
				playCards[room][0].priority = !playCards[room][0].priority;
			} else {
				playCards[room][index + 1].priority =
					!playCards[room][index + 1].priority;
			}
			playCards[room] = playCards[room].filter((player) => player.sum < 21);
			socket.emit('result', 'You lose');
			io.sockets.to(room).emit('endTurn', { playCards: playCards[room] });
		}
	});

	socket.on('endTurn', ({ room, user }) => {
		let newUser = playCards[room].find((obj) => obj.name === user);
		let index = playCards[room].indexOf(newUser);
		newUser.priority = !newUser.priority;
		if (index === playCards[room].length - 1) {
			playCards[room][0].priority = !playCards[room][0].priority;
		} else {
			playCards[room][index + 1].priority =
				!playCards[room][index + 1].priority;
		}

		io.sockets.to(room).emit('endTurn', { playCards: playCards[room] });
	});

	socket.on('dealerTurn', ({ room }) => {
		let deck = gameDecks[room];
		let dealer = playCards[room][0];
		while (dealer.sum < 17) {
			dealer.cards.push(deck.pop());
			dealer.sum = getSum(dealer.cards);
			io.sockets.to(room).emit('getCard', { playCards: playCards[room] });
		}
		const sums = playCards[room].map((user) => [user.sum, user.name]);
		for (let i = 1; i < sums.length; i++) {
			let index = users.indexOf(sums[i][1]);

			let id = users[index - 1];

			if (sums[0][0] === 21 && sums[0][0].length === 2) {
				io.to(id).emit('result', 'You lose');
			} else if (sums[i][0] === 21 && sums[i][0].length === 2) {
				io.to(id).emit('result', 'You win');
			} else if (sums[i][0] === sums[0][0]) {
				io.to(id).emit('result', "It' a tie");
			} else if (sums[i][0] === 21) {
				io.to(id).emit('result', 'You win');
			} else if (sums[0][0] > 21) {
				io.to(id).emit('result', 'You win');
			} else if (sums[i][0] < sums[0][0]) {
				io.to(id).emit('result', 'You lose');
			} else if (sums[i][0] > sums[0][0]) {
				io.to(id).emit('result', 'You win');
			}
		}
	});
	socket.on('disconnecting', () => {
		let allRooms = [...socket.rooms];
		let index = users.indexOf(socket.id);
		let currentUser = users[index + 1];

		for (let i = 1; i < allRooms.length; i++) {
			rooms[allRooms[i]] = rooms[allRooms[i]].filter(
				(user) => user !== currentUser
			);
		}

		if (users.length === 2) {
			users = [];
		} else {
			users = users.filter((user) => {
				return user != currentUser || user != socket.id;
			});
		}
	});
});

server.listen(PORT, () => {
	console.log('Server is running on port ' + PORT);
});
