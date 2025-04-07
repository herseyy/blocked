import Button from "../components/Button";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

import axios from "axios";
import { useSocket } from '../socket';


function Lobby({ user, role }) {
	const socket = useSocket();

	const [isVisible, setIsVisible] = useState(false);
	const [inputElements, setInputElements] = useState([]);
	const [inputTestElements, setInputTestElements] = useState([]);
	const [rooms, setRooms] = useState([]);

	const navigate = useNavigate();
	const userId = user.uid;
	
    async function fetchRooms() {
      try {
      	if (role == "admin") {
	        const res = await axios.get(`http://localhost:3000/api/rooms/getRooms?userId=${userId}`);
	        setRooms(res.data);
      	}
        // console.log(res.data)
      } catch (err) {
        console.log(`ERROR GETTING ROOMS: ${err.message}`);
      }
    }
	useEffect(() => {
	    fetchRooms();
	}, []);

	async function enterRoom(roomId = "") {
		if (role == "admin") {
			socket.emit('joinRoom', { roomId: roomId, userId: user.uid });
			navigate(`/rooms/${roomId}`, {
				state: {"roomId": roomId}
			})
		} else {
			const roomIdInput = document.getElementById("roomIdInput").value
			
			const res = await axios.get(`http://localhost:3000/api/rooms/getRoom?roomId=${roomIdInput}`);
			
			if (res.data) {
				socket.emit('joinRoom', { roomId: roomIdInput, userId: user.uid });
				navigate(`/rooms/${roomIdInput}`, {
					state: {"roomId": roomIdInput}
				})
			}
		}
	}

	async function addRoom() {
		setIsVisible(!isVisible);
	}

	function addProblem() {
		setInputElements([
			...inputElements,
			{ id: inputElements.length, label: 'Problem Title', type: 'text' }
		])

		console.log(inputElements)
	}

	function addTestCase(problemId) {
		setInputTestElements((prev) => [
			...prev,
			{
				id: prev.length,        // ← Give each test case a unique id
				problemId: problemId    // ← Associate with the correct problem
			}
		]);
	}

	function getRooms() {

	}

	async function createRoom() {
		const problemData = {};

		inputElements.forEach((problem) => {
			const title = document.getElementById(`problem-${problem.id}`)?.value.trim();

			if (!title) return; // skip if title is empty

			const relatedTests = inputTestElements.filter(tc => tc.problemId === problem.id);

			const testCases = {};

			relatedTests.forEach((tc, index) => {
				const input = document.getElementById(`testCaseInput-${tc.id}`)?.value || "";
				const output = document.getElementById(`testCaseOutput-${tc.id}`)?.value || "";

				testCases[index] = { input, output };
			});

			problemData[title] = testCases;
		});

		console.log("🔥 Final Data:", problemData);

		setIsVisible(false)
		setInputElements([])
		setInputTestElements([])

		await axios.post("http://localhost:3000/api/rooms/createRoom", {
			problemData,
			userId
		}).then((res) => {
			console.log(res.data)
			fetchRooms();
		}).catch((err) => {
			console.log(`ERROR CREATING ROOM: ${err.code} - ${err.message}`)
		})
	}

	return(
		<div>
			<h1>HALLOOO</h1>
			<p>{role}</p>
			{role == "admin" ? 
				<div>
					<Button text="Add Room" func={addRoom} />
					<div
				        style={{
				          display: isVisible ? 'flex' : 'none', // Show if isVisible is true, otherwise hide
				          flexDirection: 'column',
				          marginTop: '10px',
				          padding: '10px',
				          backgroundColor: '#f0f0f0',
				          borderRadius: '5px',
				        }}
				      >
						<button onClick={addProblem}>Add problem</button>
						<div>
							{inputElements.map((inputElement) => (
								<div key={inputElement.id}>
									<label htmlFor={`problem-${inputElement.id}`}>{inputElement.label}: </label>
									<textarea id={`problem-${inputElement.id}`} type={inputElement.type} onInput={(e) => {
												    e.target.style.height = "auto";
												    e.target.style.height = `${e.target.scrollHeight}px`;
												  }}
												  style={{ overflow: 'hidden', resize: 'none' }}
												  />
									<button onClick={() => addTestCase(inputElement.id)}>Add test Case</button>

									{/* Test cases tied to this problem */}
									{inputTestElements
										.filter(tc => tc.problemId === inputElement.id)
										.map((test) => (
											<div key={test.id}>
												<label htmlFor={`testCaseInput-${test.id}`}>Input: </label>
												<textarea id={`testCaseInput-${test.id}`} onInput={(e) => {
												    e.target.style.height = "auto";
												    e.target.style.height = `${e.target.scrollHeight}px`;
												  }}
												  style={{ overflow: 'hidden', resize: 'none' }}
												  />
												<label htmlFor={`testCaseOutput-${test.id}`}>Output: </label>
												<textarea id={`testCaseOutput-${test.id}`} onInput={(e) => {
												    e.target.style.height = "auto";
												    e.target.style.height = `${e.target.scrollHeight}px`;
												  }}
												  style={{ overflow: 'hidden', resize: 'none' }}
												  />
											</div>
										))}
								</div>
							))}

						</div>
						<button onClick={createRoom}>Create Room</button>
					</div>
					
					<div>
						<h1>Rooms</h1>
						{rooms ? 
							<div>
							    {Object.keys(rooms).map((roomId) => {
							      const room = rooms[roomId]; // Get room details using roomId
							      return (
							        <div key={roomId}>
										<h3>Room ID: {roomId}</h3>
										<p>User ID: {room.userId}</p>
										<p>Created At: {room.createdAt}</p>
										{room.players ? 
											<p>Players: {room.players.length}</p>
										: 
											<p>Players: 0</p>
										}
										<button onClick={() => enterRoom(roomId)}>Join Room</button>
							        </div>
							      );
							    })}
							</div>
						: null}
					</div>
				</div>
			:
				<div>
					<label htmlFor="roomIdInput">Find Room: </label>
					<input
						id="roomIdInput"
						type="text"
					/>
					<button onClick={enterRoom}>Enter Room</button>
				</div>
			}
		</div>
	)
}


export default Lobby