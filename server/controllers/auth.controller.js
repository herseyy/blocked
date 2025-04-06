import { db } from "../config/firebaseAdmin.config.js";

export async function signup(req, res) {
	console.log(req.body)
	
	const { userId, email, username} = req.body;

  	try {
	    await db.ref("users/" + userId).set({
	    	username,
	    	email,
	    	role: "user",
	    	createdAt: new Date().toISOString(),
		});

	    return res.status(201).json({
	    	message: "User created successfully!",
	    	user: { userId, username, email },
		});

  	} catch(err) {
  		console.error('Error creating user:', err);
  		return res.status(400).json({ err: err.message });
  	}
}