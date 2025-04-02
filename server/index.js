import express from "express";
import cors from "cors";

import roomRoutes from "./routes/room.route.js"

const app = express();
const PORT = 3000;

app.use(cors({
	origin:[
		"http://localhost:5173"
	]
}))

app.use("/api/rooms", roomRoutes);

app.get("/", (req, res) => {
	res.send("Hello World!");
});

app.listen(PORT, () => {
	console.log(`server listening to ${PORT}`)
})