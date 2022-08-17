import React from 'react';
import { useState, useContext, useEffect, useRef } from 'react';
import { AppContext } from '../Context/AppProvider';
import { getSum } from '../getSum';

function Game() {
	const { user, socket, room } = useContext(AppContext);
	const [deck, setDeck] = useState([]);
	const [dealerCards, setDealerCards] = useState({});
	const [usersCards, setUsersCards] = useState([]);
	const [check, setCheck] = useState('');
	const [result, setResult] = useState('');
	const buttonRef = useRef(null);

	let imageLink = '/images/cards';

	const playAgain = () => {
		socket.emit('playAgain', { room, user, message: 'willing' });
	};
	const getCard = () => {
		//find current client
		const found = usersCards.find((name) => name?.priority === 'true');
		//find index of current client
		const index = usersCards.indexOf(found);
		//copy deck and usersCards
		let newDeck = [...deck];
		let newUserCards = [...usersCards];

		// new card added to current user
		const newUser = { ...found, cards: found.cards.concat(newDeck.pop()) };

		//replace in copy array the new user.
		newUserCards[index] = newUser;

		//get sum of current user's array of cards
		newUserCards[index].sum = getSum(newUserCards[index].cards);

		// if 21 can only press stay
		if (newUserCards[index].sum === 21) {
			buttonRef.current.classList.add('none');
		}
		//larger than 21,set lose message,uncheck priority of current user,
		//set priority of the next user or of the dealer and send the relevant info to update.
		if (newUserCards[index].sum > 21) {
			setResult('Bust.You lose!');
			newUserCards[index].priority =
				newUserCards[index].priority === 'true' ? 'false' : 'true';
			if (index === 0 && newUserCards.length > 1) {
				newUserCards[index + 1].priority =
					newUserCards[index + 1].priority === 'true' ? 'false' : 'true';
			} else {
				let newDealerCards = {
					...dealerCards,
					priority: dealerCards.priority === 'true' ? 'false' : 'true',
				};
				setDealerCards(newDealerCards);
				socket.emit('dealerTurn', {
					dealerCards: newDealerCards,
					usersCards: newUserCards,
					room,
				});
			}
			//update state and sent info to reflect the changes and remove user from the other player's game
			setUsersCards(newUserCards);
			setDeck(newDeck);
			setCheck('false');
			socket.emit('gameLost', {
				newUser,
				newDeck,
				usersCards: newUserCards,
				room,
			});
		} else {
			//lower than 21,normal info update
			setUsersCards(newUserCards);
			setDeck(newDeck);
			socket.emit('update', { deck: newDeck, room, usersCards: newUserCards });
		}
	};

	const endTurn = () => {
		setCheck('false');
		let newUserCards = [...usersCards];
		let found = usersCards.find((name) => name?.priority === 'true');
		const index = usersCards.indexOf(found);
		found.priority = found.priority === 'true' ? 'false' : 'true';
		newUserCards[index] = found;
		if (index === 0 && newUserCards.length > 1) {
			newUserCards[index + 1].priority =
				newUserCards[index + 1].priority === 'true' ? 'false' : 'true';
			setUsersCards(newUserCards);
			socket.emit('endTurn', { room, usersCards: newUserCards });
		} else {
			let newDealerCards = {
				...dealerCards,
				priority: dealerCards.priority === 'true' ? 'false' : 'true',
			};
			setDealerCards(newDealerCards);
			socket.emit('dealerTurn', {
				deck,
				dealerCards: newDealerCards,
				usersCards: newUserCards,
				room,
			});
		}
	};

	useEffect(() => {
		socket.emit('initialize', { room, answer: 'no' });
		socket.on('restart', (answer) => {
			if (answer === 'yes') {
				setResult('');
				socket.emit('initialize', { room, answer: 'yes' });
			}
		});
		return () => {
			socket.removeAllListeners('initialize');
		};
	}, [socket, room]);

	useEffect(() => {
		socket.on('initialize', (data) => {
			setDeck(data.deck);
			setDealerCards(data.playCards[0]);
			setUsersCards(data.playCards.slice(1));
			setCheck(
				data.playCards.slice(1).find((name) => name.user === user).priority
			);
		});

		socket.on('results', (message) => {
			setResult(message);
			setCheck('false');
		});
		socket.on('endTurn', (data) => {
			setCheck('true');
			setDealerCards(data.playCards[0]);
			setUsersCards(data.playCards.slice(1));
		});

		socket.on('update', (data) => {
			if (data.deck !== deck) {
				setDeck(data.deck);
			}
			setDealerCards(data.playCards[0]);
			setUsersCards(data.playCards.slice(1));
		});
	}, [socket, room, user, deck]);
	return (
		<div className="game">
			<div className="players">
				<div className="dealer">
					<div className="dealer__header">
						<h2 className={dealerCards?.priority === 'true' ? 'red' : ''}>
							Dealer
						</h2>
						{dealerCards?.priority === 'true' && (
							<p>Score: {dealerCards?.sum}</p>
						)}
					</div>
					<div className="dealer__cards">
						{dealerCards?.cards?.map((card, index) => {
							return (
								<img
									src={`${imageLink}/${
										dealerCards?.priority === 'true' || index > 0
											? card
											: 'BACK'
									}.png`}
									key={index}
									alt=""
								/>
							);
						})}
					</div>
				</div>
				<div className="users">
					{usersCards.map((user, index) => {
						return (
							<div className="users__container" key={index}>
								<div className="users__header">
									<h2
										className={
											!result && user?.priority === 'true' ? 'red' : ''
										}
									>
										{user?.user[0].toUpperCase() + user?.user.slice(1)}
									</h2>
									<p>Score: {user?.sum}</p>
								</div>
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
				{result && <p className="result">{result}</p>}
			</div>

			<div className="actions">
				<button
					ref={buttonRef}
					className="button"
					onClick={getCard}
					disabled={check === 'true' ? false : true}
				>
					Hit
				</button>
				<button
					className="button"
					disabled={check === 'true' ? false : true}
					onClick={endTurn}
				>
					Stay
				</button>
				{result && result !== 'Bust.You lose!' && (
					<button className="button" onClick={playAgain}>
						Play Again
					</button>
				)}
				<p>User:{user}</p>
			</div>
		</div>
	);
}

export default Game;
