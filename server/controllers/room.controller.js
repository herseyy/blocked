import { db } from "../config/firebaseAdmin.config.js";
import { v4 as uuidv4 } from 'uuid';

export async function createRoom(req, res) {
	const id = uuidv4();
	console.log(req.body)
	
	const { problemData, userId } = req.body;
	// console.log(problemData)

  	try {

	    await db.ref("rooms/" + id).set({
	    	userId,
	    	players: [],
	    	problems: problemData,
	    	createdAt: new Date().toISOString(),
		});

	    return res.status(201).json({
	    	message: "Room created successfully!"
		});

  	} catch(err) {
  		console.error('Error creating room:', err);
  		return res.status(400).json({ err: err.message });
  	}
}

export async function getRooms(req, res) {
	const userId = req.query.userId; // Get userId from query parameter

	if (!userId) {
		return res.status(400).json({ error: "Missing userId" });
	}

	try {
		const roomsRef = db.ref("rooms");

		const snapshot = await roomsRef
			.orderByChild("userId")
			.equalTo(userId)
			.once("value");

		if (!snapshot.exists()) {
		  return res.status(404).json({ message: "No rooms found for this user" });
		}

		const rooms = snapshot.val(); // Get the rooms data
		console.log(rooms)
		return res.status(200).json(rooms);
	} catch (error) {
		console.error("Error fetching rooms:", error);
		return res.status(500).json({ error: error.message });
	}
}

export async function getCurrentRoom(req, res) {
	const { roomId } = req.query;

	console.log(roomId)

	if (!roomId) {
		return res.status(400).json({ error: "Missing roomId" });
	}

	try {
		const roomsRef = db.ref("rooms/" + roomId);
		const snapshot = await roomsRef.once("value")

		if (!snapshot.exists()) {
		  return res.status(404).json({ message: "No room found" });
		}

		const room = snapshot.val();
		return res.status(200).json(room.problems);

	} catch (error) {
		console.error("Error fetching room:", error);
		return res.status(500).json({ error: error.message });
	}
}