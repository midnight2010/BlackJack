function shuffleDeck(deck) {
	for (let i = 0; i < deck.length; i++) {
		let j = Math.floor(Math.random() * deck.length);
		[deck[i], deck[j]] = [deck[j], deck[i]];
	}
}

module.exports = shuffleDeck;
