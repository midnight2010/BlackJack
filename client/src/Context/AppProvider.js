import React, { createContext, useState } from 'react';
import { useEffect } from 'react';
import io from 'socket.io-client';

const socket = io.connect(process.env.REACT_APP_URL);

export const AppContext = createContext(null);

function AppProvider({ children }) {
	const [user, setUser] = useState('');
	const [room, setRoom] = useState('');
	const [numberPlayers, setNumberPlayers] = useState(0);

	const joinRoom = () => {
		socket.emit('joinRoom', { room, user });
		if (!(numberPlayers === -1)) {
			socket.emit('checkPlayers', { room });
		}
	};

	useEffect(() => {
		socket.on('joinedRoom', (size) => {
			setNumberPlayers(size);
		});
		socket.on('reject', () => {
			setNumberPlayers(-1);
		});
		return () => {
			socket.removeAllListeners('joinedRoom');
		};
	}, []);

	return (
		<AppContext.Provider
			value={{
				numberPlayers,
				user,
				room,
				joinRoom,
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
