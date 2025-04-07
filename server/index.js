import express from "express";
import cors from "cors";

import { Server } from 'socket.io';
import { instrument } from '@socket.io/admin-ui'
import  { createServer } from 'http';

import roomRoutes from "./routes/room.route.js"
import authRoutes from "./routes/auth.route.js"

import { runCode } from "./utils/executeCode.js";

const app = express();
const PORT = 3000;

app.use(cors({
	origin:[
		"http://localhost:5173",
		"https://admin.socket.io"
	]
}))

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/api/rooms", roomRoutes);
app.use("/api/auth", authRoutes);

app.get("/", (req, res) => {
	res.send("Hello World!");
});

app.post("/run", async (req, res) => {
	const { code, input, language } = req.body;

	try {
		const output = await runCode({ language, code, input });
		console.log(output);
		res.send(output);
	} catch (err) {
		console.error(err);
		res.status(500).send("Error running code");
	}
})


app.post("/check", async (req, res) => {
	const { language, code, testCases, selectedProblem } = req.body;
	let cnt = 1;

	try {
		for (const testCase of testCases) {
			console.log(testCase)
			const input = testCase.input;
			const expectedOutput = testCase.output;

			const output = await runCode({ language, code, input });

			if (output.trim() !== expectedOutput.trim()) {
				res.send({selectedProblem, status: `wrong answer test case: ${cnt}`})
				return
			}
		}

		res.send({selectedProblem, status: "accepted"});
	} catch (err) {
		console.error(err);
		res.status(500).send("Error checking test cases");
	}
})


const httpServer = createServer(app);
const io = new Server(httpServer, {
	cors: {
		origin: [
			"http://localhost:5173", 
			"https://admin.socket.io"
		],
    	credentials: true
	}
});

io.on('connection', (socket) => {
	console.log("connected")

	socket.on("joinRoom", (data) => {
		const { userId, roomId } = data;

		console.log(`User ${userId} is joining room ${roomId}`);
		socket.join(roomId)

		io.to(roomId).emit('roomMessage', {
			message: `User ${userId} has joined room ${roomId}`,
			userId,
			roomId,
		});

		socket.emit('joinRoomSuccess', { message: `You have successfully joined room ${roomId}` });
	})

	socket.on("submit", (data) => {
		const { code, selectedProblem, roomId, userId } = data;
		console.log(data)

		io.emit("submit-check", data)
	})

	socket.on("userID", (data) => {
		console.log(data, "xxxxxxxxxxs")
		io.emit(data.data.userId, data.status)
	})

	socket.on('disconnect', () => {
		console.log('A user disconnected');
	});
});

instrument(io, {auth: false})


httpServer.listen(PORT, () => {
	console.log(`Example app listening to port ${PORT}`);
});


// app.listen(PORT, () => {
// 	console.log(`server listening to ${PORT}`)
// })