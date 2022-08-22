const getValue = (card) => {
	let value = card.split('-')[0];
	if (value === 'A') {
		return 11;
	}
	if (value === 'Q' || value === 'K' || value === 'J') {
		return 10;
	} else return parseInt(value);
};

const getSum = (cards) => {
	let sum = 0;
	let ace = 0;
	for (let i = 0; i < cards.length; i++) {
		if (cards[i].indexOf('A') !== -1) {
			ace += 1;
		}

		let newCard = getValue(cards[i]);
		sum += newCard;
	}
	while (sum > 21 && ace > 0) {
		sum -= 10;
		ace -= 1;
	}

	return sum;
};

module.exports = getSum;
