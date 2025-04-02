import express from "express";
import cors from "cors";

import roomRoutes from "./routes/room.route.js"

import piston from "piston-client"

const app = express();
const PORT = 3000;

app.use(cors({
	origin:[
		"http://localhost:5173"
	]
}))

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/api/rooms", roomRoutes);

app.get("/", (req, res) => {
	res.send("Hello World!");
});

app.post("/run", async (req, res) => {
	console.log(req.body)
	console.log("hhehekfoafi")

	const client = piston({ server: "https://emkc.org" });
	const runtimes = await client.runtimes();
	const result = await client.execute(
		"python",
		"print('Hellllo World')"
	)
	console.log(result)
})

app.listen(PORT, () => {
	console.log(`server listening to ${PORT}`)
})