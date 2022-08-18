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
let dealer = ['dealer'];
let users = [];
let playCards = [];
let originalDeck = buildDeck();
let deck = [...originalDeck];
let popCards;
let playAgain = {};

setInterval(() => {
	shuffleDeck(originalDeck);
	deck = [...originalDeck];
	popCards = initialize();
}, 60 * 1000);

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
}

io.on('connection', (socket) => {
	socket.on('joinRoom', (data) => {
		size = io.sockets.adapter.rooms.get(data.room)?.size;
		if (size > 1) {
			io.to(socket.id).emit('reject');
			socket.disconnect();
		} else {
			socket.join(data.room);
			if (!keys[data.room]) {
				keys[data.room] = {};
				keys[data.room][data.user] = socket.id;
			} else {
				keys[data.room][data.user] = socket.id;
			}
		}
	});

	socket.on('checkPlayers', (data) => {
		size = io.sockets.adapter.rooms.get(data.room)?.size;
		if (size === 2) {
			io.to(socket.id).emit('joinedRoom', size);
		}
		socket.to(data.room).emit('joinedRoom', size);
	});

	socket.on('playAgain', (data) => {
		const { user, room, message } = data;
		if (!playAgain[room]) {
			playAgain[room] = {};
			playAgain[room][user] = message;
		} else {
			playAgain[room][user] = message;
		}
		if (playAgain[room]?.length === keys[room]?.length) {
			deck = [...originalDeck];
			popCards = initialize();
			io.to(socket.id).emit('restart', 'yes');
			socket.to(room).emit('restart', 'yes');
		}
	});

	socket.on('dealerTurn', (data) => {
		deck = [...data.deck];
		let newArray = [data.dealerCards, ...data.usersCards];
		socket.to(data.room).emit('update', { deck, playCards: newArray });
		while (data.dealerCards.sum < 17) {
			data.dealerCards.cards.push(deck.pop());
			data.dealerCards.sum = getSum(data.dealerCards.cards);
			playCards = [data.dealerCards, ...data.usersCards];
			io.to(socket.id).emit('update', {
				deck,
				playCards,
			});
			socket.to(data.room).emit('update', {
				deck,
				playCards,
			});
		}

		const sums = playCards.map((user) => [user.sum, user.user]);
		for (let i = 1; i < sums.length; i++) {
			let id = keys[data.room][sums[i][1]];
			let message;

			const send = (message) => {
				io.to(id).emit('results', message);
			};

			if (sums[i][0] === sums[0][0]) {
				message = "It' a tie";
				send(message);
			} else if (sums[i][0] === 21) {
				message = 'You win';
				send(message);
			} else if (sums[0][0] > 21) {
				message = 'You win';
				send(message);
			} else if (sums[i][0] < sums[0][0]) {
				message = 'You lose';
				send(message);
			} else if (sums[i][0] > sums[0][0]) {
				message = 'You win';
				send(message);
			}
		}
	});

	socket.on('update', (data) => {
		deck = [...data.deck];
		playCards = [playCards[0], ...data.usersCards];
		socket.to(data.room).emit('update', { deck, playCards });
	});

	socket.on('endTurn', (data) => {
		if (data.usersCards) {
			let newArray = [playCards[0], ...data.usersCards];
			playCards = newArray;
		} else if (data.dealerCards) {
			let newArray = [data.dealerCards, ...playCards.slice(1)];
			playCards = newArray;
		}
		socket.to(data.room).emit('endTurn', { playCards });
	});

	socket.on('gameLost', (data) => {
		deck = [...data.newDeck];
		playCards = [playCards[0], ...data.usersCards];

		const name = data.newUser.user;

		users = users.filter((user) => user !== name);

		playCards = playCards.filter((user) => !(user.sum > 21));
		socket.to(data.room).emit('lessPlayers', { deck, playCards });
	});

	socket.on('initialize', ({ room }) => {
		if (keys[room]) {
			let newUsers = Object.keys(keys[room]);
			users = dealer.concat(newUsers);
		}
		let newArray = [...popCards];
		for (let i = 0; i < users.length; i++) {
			playCards[i] = {
				user: users[i],
				cards: newArray.splice(-2),
				priority: 'false',
			};
		}
		playCards[1].priority = 'true';
		checkForBlackJack(playCards);
		socket.to(room).volatile.emit('initialize', { deck, playCards });
	});

	socket.on('disconnecting', () => {
		let selectedRoom;
		for (const room in keys) {
			for (const user in keys[room]) {
				if (keys[room][user] === socket.id) {
					selectedRoom = room;
					delete keys[room][user];
				}
			}
		}
		if (keys[selectedRoom]?.size === 1) {
			delete keys[selectedRoom];
		}
	});
});

server.listen(PORT, () => {
	console.log('Server is running on port ' + PORT);
});
