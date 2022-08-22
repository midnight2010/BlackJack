import { useContext, useState, useEffect } from 'react';
import { AppContext } from '../Context/AppProvider';

function Join() {
	const { socket, user, room, setUser, setRoom, setStartGame } =
		useContext(AppContext);
	const [localUser, setLocalUser] = useState('');
	const [localRoom, setLocalRoom] = useState('');
	const [error, setError] = useState('');
	const [wait, setWait] = useState(false);
	const joinRoom = () => {
		if (!localRoom || !localUser) {
			setError('Fields must not be empty');
			return;
		}
		setWait(true);
		setLocalRoom('');
		setLocalUser('');
		socket.emit('joinRoom', { user, room });
	};

	const verify = (e) => {
		if (e.target.type === 'text') {
			if (e.target.value === '') {
				setLocalUser('');
				return;
			}
			if ('0123456789'.indexOf(e.target.value[0]) > -1) {
				setError('First character must be a letter');
			} else if (e.target.value[0] === e.target.value[0].toLowerCase()) {
				setError('First letter must be uppercase');
			} else {
				setUser(e.target.value);
				setLocalUser(e.target.value);
			}
		}
		if (e.target.type === 'tel') {
			if (e.target.value === '') {
				setLocalRoom('');
				return;
			}
			if (e.target.value > 100) {
				setError('Number must not higher than 10');
			} else if (!/^[1-9]+$/.test(e.target.value)) {
				setError('Room must be a valid number');
			} else {
				setLocalRoom(e.target.value);
				setRoom(e.target.value);
			}
		}
	};

	useEffect(() => {
		socket.on('startGame', () => {
			setStartGame(true);
		});

		socket.on('reject', ({ message }) => {
			setWait((prev) => !prev);
			setError(message);
		});

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<div className="joinChatContainer main">
			<input
				type="text"
				placeholder="Your Name"
				value={localUser}
				onChange={verify}
				disabled={error ? true : false}
			/>

			<input
				type="tel"
				placeholder="Room..."
				value={localRoom}
				onChange={verify}
				disabled={error ? true : false}
			/>
			{error && (
				<p
					className={error ? 'modal' : 'hide'}
					onAnimationEnd={(e) => {
						e.target.classList.remove('modal');
						e.target.classList.add('hide');
						setError('');
					}}
				>
					{error}
				</p>
			)}
			<button className="button" onClick={joinRoom}>
				Join A Room
			</button>
			{wait && (
				<h2 className="wait">
					Waiting for other players to join
					<div className="dot"></div>
					<div className="dot"></div>
					<div className="dot"></div>
				</h2>
			)}
		</div>
	);
}

export default Join;
