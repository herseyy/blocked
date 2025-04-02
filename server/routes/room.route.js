import express from "express"
const router = express.Router();

router.get("/public", () => {
	console.log("hello")
})

export default router;