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

export const getSum = (cards) => {
	let sum = 0;
	let ace = 0;
	for (let i = 0; i < cards.length; i++) {
		if (cards[i].startsWith('A', 0)) {
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
