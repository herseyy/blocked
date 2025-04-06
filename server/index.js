import express from "express";
import cors from "cors";

import roomRoutes from "./routes/room.route.js"
import authRoutes from "./routes/auth.route.js"

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
app.use("/api/auth", authRoutes);

app.get("/", (req, res) => {
	res.send("Hello World!");
});

app.post("/run", async (req, res) => {
	const code = req.body.code.join("\n")
	const input =  req.body.input
	const language = req.body.language

	const client = piston({ server: "https://emkc.org" });
	const result = await client.execute({
		language,
		"files": [{"content": code}],
		"stdin": input,
		// "compileTimeout": 1,
        // "runTimeout": 1,
        // "compileMemoryLimit": -1,
        // "runMemoryLimit": -1
	})

	console.log(result)
	res.send(result.run.output)
})

app.listen(PORT, () => {
	console.log(`server listening to ${PORT}`)
})