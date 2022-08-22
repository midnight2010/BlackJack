import React from 'react';

function Dealer({ dealerCards }) {
	return (
		<div className="dealer">
			<div className="dealer__header">
				<h2 className={dealerCards.priority ? 'priority' : ''}>
					{dealerCards.name}
				</h2>
				<p>Score: {dealerCards.sum} </p>
			</div>
			<div className="dealer__cards">
				{dealerCards.cards.map((card, index) => (
					<img
						src={`images/cards/${
							dealerCards.priority === 'false' && index === 0 ? 'BACK' : card
						}.png`}
						alt={card}
						key={index}
					/>
				))}
			</div>
		</div>
	);
}

export default Dealer;
