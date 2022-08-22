function buildDeck() {
	const values = [
		'A',
		'2',
		'3',
		'4',
		'5',
		'6',
		'7',
		'8',
		'9',
		'10',
		'J',
		'Q',
		'K',
	];
	const types = ['C', 'D', 'H', 'S'];
	const deck = [];
	for (let i = 0; i < types.length; i++) {
		for (let j = 0; j < values.length; j++) {
			deck.push(values[j] + '-' + types[i]);
		}
	}
	shuffleDeck(deck);
	return deck;
}

function shuffleDeck(deck) {
	for (let i = 0; i < deck.length; i++) {
		let j = Math.floor(Math.random() * deck.length);
		[deck[i], deck[j]] = [deck[j], deck[i]];
	}
}

module.exports = buildDeck;
