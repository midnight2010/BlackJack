import { useContext, useState } from 'react';
import Wait from './Wait';
import Game from './Game';
import Join from './Join';
import Error from './Error';
import { AppContext } from '../Context/AppProvider';

function Main() {
	const [check, setCheck] = useState(false);
	const { numberPlayers } = useContext(AppContext);
	return (
		<div>
			{numberPlayers < 2 && <Join setCheck={setCheck} check={check} />}
			{numberPlayers === -1 && <Error />}
			{check && numberPlayers === 0 && <Wait />}
			{numberPlayers === 2 && <Game />}
		</div>
	);
}

export default Main;
