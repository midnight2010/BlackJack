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

	return deck;
}

module.exports = buildDeck;
