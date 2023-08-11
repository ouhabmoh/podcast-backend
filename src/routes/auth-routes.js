import express from "express";
import passport from "../passportConfig.js";
import { signToken } from "../jwt.js";

const authRouter = express.Router();

authRouter.post("/login", (req, res, next) => {
	// req.body.local = {
	// 	username: req.body.username,
	// 	password: req.body.password,
	// };
	// req.body.local.username = req.body.username;
	// req.body.local.password = req.body.password;
	console.log(req.body);
	passport.authenticate("local-login", async (err, user, info) => {
		if (err) {
			return next(err);
		}
		if (!user) {
			return res.status(400).json({ message: info.message });
		}
		// If registration is successful, sign a JWT token and send it in the response
		const token = await signToken(user);

		return res.status(200).json({
			token: token,
			userId: user._id,
			name: user.local.name,
			role: user.role,
		});
	})(req, res, next);
});

authRouter.post("/register", (req, res, next) => {
	passport.authenticate("local-register", async (err, user, info) => {
		if (err) {
			return next(err);
		}
		if (!user) {
			return res.status(400).json({ message: info.message });
		}
		// If registration is successful, sign a JWT token and send it in the response
		const token = await signToken(user);

		return res.status(200).json({
			token: token,
			userId: user._id,
			name: user.local.name,
			role: user.role,
		});
	})(req, res, next);
});

authRouter.get(
	"/google",
	passport.authenticate("google", { scope: ["email", "profile"] })
);
authRouter.get(
	"/google/callback",
	passport.authenticate("google", { session: false }),
	async (req, res) => {
		const user = req.user;
		if (!user) {
			return res.status(400).json({ message: info.message });
		}
		// If registration is successful, sign a JWT token and send it in the response
		const token = await signToken(user);

		return res.status(200).json({
			token: token,
			userId: user._id,
			name: user.google.name,
			role: user.role,
		});
	}
);

authRouter.get("/facebook", passport.authenticate("facebook"));
authRouter.get(
	"/facebook/callback",
	passport.authenticate("facebook", { session: false }),
	async (req, res) => {
		const user = req.user;
		if (!user) {
			return res.status(400).json({ message: info.message });
		}
		// If registration is successful, sign a JWT token and send it in the response
		const token = await signToken(user);

		return res.status(200).json({
			token: token,
			userId: user._id,
			name: user.facebook.name,
			role: user.role,
		});
	}
);

export default authRouter;
