import React, { createContext, useState } from 'react';
import io from 'socket.io-client';

const socket = io.connect(process.env.REACT_APP_URL);

export const AppContext = createContext(null);

function AppProvider({ children }) {
	const [user, setUser] = useState('');
	const [room, setRoom] = useState('');
	const [startGame, setStartGame] = useState('');
	const [disable, setDisable] = useState(true);
	const [result, setResult] = useState('');

	return (
		<AppContext.Provider
			value={{
				result,
				setResult,
				disable,
				setDisable,
				startGame,
				setStartGame,
				user,
				room,
				setUser,
				setRoom,
				socket,
			}}
		>
			{children}
		</AppContext.Provider>
	);
}

export default AppProvider;
