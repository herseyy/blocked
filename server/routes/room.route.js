import express from "express"
import { createRoom, getRooms, getCurrentRoom, addPlayer } from "../controllers/room.controller.js"


const router = express.Router();

router.get("/getRooms", getRooms);
router.get("/getRoom", getCurrentRoom);
router.post("/addPlayer", addPlayer);
router.post("/createRoom", createRoom);

export default router;