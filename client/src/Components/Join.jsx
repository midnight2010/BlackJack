import { useContext, useState } from 'react';
import { AppContext } from '../Context/AppProvider';

function Join({ setCheck, check }) {
	const { setUser, setRoom, joinRoom } = useContext(AppContext);
	const obj = { text: '', number: '' };
	const [inputs, setInputs] = useState(obj);
	const onSubmit = (e) => {
		e.preventDefault();
		setInputs(obj);
	};

	return (
		<form className="joinChatContainer" onSubmit={onSubmit}>
			<input
				type="text"
				placeholder="Your Name"
				value={inputs.text}
				onChange={(event) => {
					setUser(event.target.value);
					setInputs({ ...inputs, text: event.target.value });
				}}
			/>
			<input
				type="number"
				max="10"
				value={inputs.number}
				placeholder="Room"
				onChange={(event) => {
					setRoom(event.target.value);
					setInputs({ ...inputs, number: event.target.value });
				}}
			/>
			<button
				className="button"
				onClick={() => {
					setCheck(!check);
					joinRoom();
				}}
			>
				Join A Room
			</button>
		</form>
	);
}

export default Join;
