const getValue = (card) => {
	let value = card.split('-')[0];
	if (isNaN(value)) {
		if (value === 'A') {
			value = 11;
		}
		value = 10;
	}

	return parseInt(value);
};

const getSum = (cards) => {
	let sum = 0;
	for (let i = 0; i < cards.length; i++) {
		let newCard = getValue(cards[i]);
		sum += newCard;
	}
	if (sum > 21 && cards.startsWith('A', 0)) {
		sum -= 10;
	}
	return sum;
};

module.exports = getSum;
