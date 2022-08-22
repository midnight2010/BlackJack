import { useState, useEffect, useContext } from 'react';
import { AppContext } from '../Context/AppProvider';
import Dealer from './Dealer';
import Players from './Players';

function Game() {
	const { socket, room, user, disable, setDisable, result, setResult } =
		useContext(AppContext);
	const [dealerCards, setDealerCards] = useState(null);
	const [players, setPlayersCards] = useState(null);

	const getCard = () => {
		socket.emit('getCard', { room, user });
	};

	const endTurn = () => {
		setDisable(true);
		socket.emit('endTurn', { room, user });
	};

	useEffect(() => {
		socket.emit('initialize', { room });
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useEffect(() => {
		socket.on('initialize', ({ playCards }) => {
			setDealerCards(playCards[0]);
			setPlayersCards(playCards.slice(1));
		});

		socket.on('getCard', ({ playCards }) => {
			setDealerCards(playCards[0]);
			setPlayersCards(playCards.slice(1));
		});

		socket.on('result', (message) => {
			setResult(message);
			setDisable(true);
		});

		socket.on('endTurn', ({ playCards }) => {
			let newPlayCards = playCards.slice(1);
			setDealerCards(playCards[0]);
			setPlayersCards(newPlayCards);
			for (let i = 0; i < newPlayCards.length; i++) {
				if (newPlayCards[i].name === user) {
					setDisable(!newPlayCards[i].priority);
				}
			}
			if (playCards[0].priority) {
				console.log('This stars the dealerTurn');
				socket.emit('dealerTurn', { room });
			}
		});
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [socket]);

	return (
		<div className="game main">
			<div className="users">
				{dealerCards && <Dealer dealerCards={dealerCards} />}
				<div className="players">
					{players &&
						players.map((player, index) => (
							<Players player={player} key={index} />
						))}
				</div>
			</div>
			<p className="result">{result}</p>
			<p>User:{user}</p>
			<div className="actions">
				<button className="button" disabled={disable} onClick={getCard}>
					Hit
				</button>
				<button className="button" disabled={disable} onClick={endTurn}>
					Stay
				</button>
				{result && (
					<button className="button" disabled={!disable}>
						Play Again
					</button>
				)}
			</div>
		</div>
	);
}

export default Game;
