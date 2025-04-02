import { useRef, useEffect } from "react";
import { useLocation } from "react-router-dom";
import "../static/room.css";

function Room() {
	const location = useLocation();

	return (
		<div className="container">
			<div className="top-container">
				<p>username</p>
				<p>Timer</p>
				<p>score</p>
			</div>
			<div className="main-container">
				<div className="members-container">
					<h1>ROOM: {location.state.roomId}</h1>
					<p>sideBar members</p>
				</div>
				<div className="editor-container">
					main code editor
					<div style={{ height: "400px", border: "1px solid #ccc" }}></div>
				</div>
				<div className="status-container">
					status
				</div>
			</div>
		</div>
	)
}

export default Room;