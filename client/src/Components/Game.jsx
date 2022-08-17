import React from 'react';
import { useState, useContext, useEffect } from 'react';
import { AppContext } from '../Context/AppProvider';

function Game() {
	const { user, socket, room } = useContext(AppContext);
	const [deck, setDeck] = useState([]);
	const [dealerCards, setDealerCards] = useState({});
	const [usersCards, setUsersCards] = useState([]);
	let check;
	if (usersCards) {
		check = usersCards.find((name) => name.user === user)?.priority;
	}

	let imageLink = '/images/cards';

	const getCard = () => {
		const found = usersCards.find((name) => name?.priority === true);
		const index = usersCards.indexOf(found);
		let newDeck = [...deck];
		let newUserCards = [...usersCards];
		const newUser = { ...found, cards: found.cards.concat(newDeck.pop()) };
		newUserCards[index] = newUser;
		setUsersCards(newUserCards);
		setDeck(newDeck);
		socket.emit('update', { deck, room, usersCards });
	};

	const endTurn = () => {
		let newUserCards = [...usersCards];
		let found = usersCards.find((name) => name?.priority === true);
		const index = usersCards.indexOf(found);
		found.priority = !found.priority;
		newUserCards[index] = found;
		if (index === 0) {
			newUserCards[index + 1].priority = !newUserCards[index + 1].priority;
			setUsersCards(newUserCards);
			socket.emit('endTurn', { room, usersCards });
		} else {
			setDealerCards({ ...dealerCards, priority: !dealerCards.priority });
		}
	};

	useEffect(() => {
		socket.emit('initialize', { room, factor: 8 });

		socket.on('initialize', (data) => {
			console.log(data.playCards);
			setDeck(data.deck);
			setDealerCards(data.playCards[0]);
			setUsersCards(data.playCards.slice(1));
		});

		socket.on('endTurn', (data) => {
			setUsersCards(data.usersCards);
		});

		socket.on('update', (data) => {
			setDeck(data.deck);
			setUsersCards(data.usersCards);
		});
	}, [socket, room]);
	return (
		<div className="game">
			<div className="players">
				<div className="dealer">
					<h2 className={dealerCards?.priority ? 'red' : ''}>Dealer</h2>
					<div className="dealer__cards">
						{dealerCards?.cards?.map((card, index) => {
							return (
								<img
									src={`${imageLink}/${
										dealerCards?.priority || index > 0 ? card : 'BACK'
									}.png`}
									key={index}
									alt=""
								/>
							);
						})}
					</div>
				</div>
				<div className="users">
					{usersCards?.map((user, index) => {
						return (
							<div className="users__container" key={index}>
								<h2 className={user.priority ? 'red' : ''}>{user?.user}</h2>
								<div className="users__cards">
									{user?.cards.map((card, index) => {
										return (
											<img
												src={`${imageLink}/${card}.png`}
												key={index}
												alt=""
											/>
										);
									})}
								</div>
							</div>
						);
					})}
				</div>
			</div>

			<div className="actions">
				<button
					className="button"
					onClick={getCard}
					disabled={check ? true : false}
				>
					Hit
				</button>
				<button
					className="button"
					disabled={check ? true : false}
					onClick={endTurn}
				>
					Stay
				</button>
			</div>
		</div>
	);
}

export default Game;
