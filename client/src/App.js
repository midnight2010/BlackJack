import { useContext } from 'react';
import { AppContext } from './Context/AppProvider';
import Join from './Components/Join';
import Game from './Components/Game';
import './scss/index.scss';

function App() {
	const { startGame } = useContext(AppContext);
	return (
		<div>
			{!startGame && <Join />}
			{startGame && <Game />}
		</div>
	);
}

export default App;
