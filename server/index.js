const express = require('express');
const app = express();
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
const buildDeck = require('./helpers/buildDeck');
const shuffleDeck = require('./helpers/shuffleDeck');
const getSum = require('./helpers/getSum');

require('dotenv').config();

const server = http.createServer(app);
const PORT = process.env.PORT || 3001;

let size;
let keys = {};
let users = ['dealer'];
let playCards = [];
let rooms = [];
let deck = buildDeck();
let popCards;

const initialize = () => {
	shuffleDeck(deck);
	let popCards = [];
	for (i = 0; i <= 5; i++) {
		popCards.push(deck.pop());
	}
	return popCards;
};

popCards = initialize();

app.use(cors());

const io = new Server(server, {
	cors: {
		origin: 'http://localhost:3000',
	},
});

function checkForBlackJack(cards) {
	const newArray = playCards.map((card) => card.cards);

	for (let i = 0; i < newArray.length; i++) {
		cards[i].sum = getSum(newArray[i]);
	}

	return cards;
}

io.on('connection', (socket) => {
	console.log(`${socket.id} has been connected`);

	socket.on('joinRoom', (data) => {
		size = io.sockets.adapter.rooms.get(data.room)?.size;
		if (size > 1) {
			io.to(socket.id).emit('reject');
			socket.disconnect();
		} else {
			socket.join(data.room);
			if (!rooms.includes(data.room)) rooms.push(data.room);
			keys[socket.id] = data.user;
			users.push(data.user);
		}
	});

	socket.on('checkPlayers', (data) => {
		size = io.sockets.adapter.rooms.get(data.room)?.size;
		if (size === 2) {
			io.to(socket.id).emit('joinedRoom', size);
			check = size + 1;
		}
		socket.to(data.room).emit('joinedRoom', size);
	});

	socket.on('update', (data) => {
		deck = data.deck;
		playCards = data.usersCards;
		socket.to(data.room).emit('update', { deck, usersCards: data.usersCards });
	});

	socket.on('endTurn', (data) => {
		let newArray;
		if (data.usersCards) {
			newArray = [playCards[0], ...data.usersCards];
		} else if (data.dealerCards) {
			newArray = [data.dealerCards, ...playCards.slice(1)];
		}
		playCards = newArray;
		socket.to(data.room).emit('endTurn', { playCards });
	});

	socket.on('gameLost', (data) => {
		playCards = data.usersCards;
		const name = data.newUser.user;
		const found = playCards.find((user) => user.user === name);
		users = users.filter((user) => user !== name);
		const index = playCards.indexOf(found);
		delete playCards[index];
		socket.leave(data.room);
		socket.to(data.room).emit('update', { deck, usersCards: playCards });
	});

	socket.on('initialize', ({ room, factor }) => {
		let newArray = [...popCards];
		for (let i = 0; i < users.length; i++) {
			playCards[i] = {
				user: users[i],
				cards: newArray.splice(-2),
				priority: i === 1 ? true : false,
				lost: false,
			};
		}
		checkForBlackJack(playCards);
		socket.to(room).emit('initialize', { deck, playCards });
	});

	socket.on('disconnect', () => {
		for (let i = 0; i < rooms.length; i++) {
			socket.leave(rooms[i]);
		}
		users = ['dealer'];
	});
});

server.listen(PORT, () => {
	console.log('Server is running on port ' + PORT);
});
