import express from "express"
import { createRoom, getRooms, getCurrentRoom } from "../controllers/room.controller.js"


const router = express.Router();

router.get("/getRooms", getRooms);
router.get("/getRoom", getCurrentRoom);
router.post("/createRoom", createRoom);

export default router;