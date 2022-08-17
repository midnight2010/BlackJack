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
		socket.to(data.room).emit('update', { deck, usersCards: data.usersCards });
	});

	socket.on('endTurn', (data) => {
		console.log(data);
		socket.to(data.room).emit('endTurn', { usersCards: data.usersCards });
	});

	socket.on('initialize', ({ room, factor }) => {
		for (let i = 0; i < users.length; i++) {
			playCards[i] = {
				user: users[i],
				cards: [popCards[i], popCards[i + 1]],
				priority: i === 1 ? true : false,
			};
		}
		console.log(checkForBlackJack(playCards));

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
