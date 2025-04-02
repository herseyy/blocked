import Button from "../components/Button";
import { useNavigate } from "react-router-dom";

function Lobby() {
	const navigate = useNavigate();
	const roomId = "1234";

	function enterRoom() {
		navigate(`/rooms/${roomId}`, {
			state: {"roomId": roomId}
		})
	}

	return(
		<div>
			<Button text="Enter Room" func={enterRoom} />
		</div>
	)
}


export default Lobby