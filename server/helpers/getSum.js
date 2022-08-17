const getValue = (card) => {
	let value = card.split('-')[0];
	if (isNaN(value)) {
		if (value === 'A') {
			return 11;
		} else return 10;
	}
	return parseInt(value);
};

const getSum = (cards) => {
	let sum = 0;
	let ace = 0;
	let newCard;
	for (let i = 0; i < cards.length; i++) {
		if (cards[i].startsWith('A', 0)) {
			ace++;
		}
		newCard = getValue(cards[i]);
		sum += newCard;
	}
	if (sum > 21 && ace > 0) {
		while (ace > 0) {
			sum -= 10;
			ace--;
		}
	}
	return sum;
};

module.exports = getSum;
