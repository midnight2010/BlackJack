import { useEffect, useContext } from 'react';
import { AppContext } from '../Context/AppProvider';

function Players({ player }) {
	const { setDisable, user } = useContext(AppContext);
	useEffect(() => {
		if (player.name === user && player.priority) {
			setDisable(false);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);
	return (
		<div className="player">
			<div className="player__header">
				<h2 className={player.priority ? 'priority' : ''}>{player.name}</h2>
				<p>Score: {player.sum} </p>
			</div>
			<div className="player__cards">
				{player.cards.map((card, index) => (
					<img src={'images/cards/' + card + '.png'} alt={card} key={index} />
				))}
			</div>
		</div>
	);
}

export default Players;
