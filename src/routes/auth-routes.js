import express from "express";
import passport from "../auth/passportConfig.js";
import { signToken } from "../auth/jwt.js";
import User from "../model/User.js";
import jwt from "jsonwebtoken";
import resetPasswordEmail from "../utils/password-reset.js";
const authRouter = express.Router();

authRouter.get("/reset-password", async (req, res) => {
	const { email } = req.body;
	console.log(email);
	try {
		const user = await User.findOne({
			"local.email": email,
		});
		if (!user) {
			return res.status(404).json({ message: "User not found" });
		}
		console.log(user);
		await resetPasswordEmail(user);
		return res.status(200).json({
			message: "Link for password reset has been sent successfully",
		});
	} catch (err) {}
});

authRouter.patch("/reset-password/:token", (req, res) => {
	const { token } = req.params;
	const { newPassword } = req.body;
	try {
		// Verifying the JWT token
		jwt.verify(
			token,
			process.env.JWT_SECRET_KEY,
			async function (err, decoded) {
				if (err) {
					console.log(err);
					res.status(401).send(
						"Password reset failed,  possibly the link is invalid or expired"
					);
				} else {
					const user = await User.findOne({
						_id: decoded.id,
					});
					if (!user) {
						return res
							.status(404)
							.json({ message: "User not found" });
					}

					// Set the new password using the setPassword method
					user.setPassword(newPassword, async (err) => {
						if (err) {
							console.error(err);
							return res.status(500).json({
								message: "Password reset failed",
							});
						}

						await user.save();

						return res.status(200).json({
							message: "Password reset successful",
						});
					});
				}
			}
		);
	} catch (e) {
		res.status(500).send("server error: " + e.message);
	}
});

authRouter.get("/confirmation/:token", (req, res) => {
	const { token } = req.params;
	try {
		// Verifying the JWT token
		jwt.verify(
			token,
			process.env.JWT_SECRET_KEY,
			async function (err, decoded) {
				if (err) {
					console.log(err);
					res.status(401).send(
						"Email verification failed,  possibly the link is invalid or expired"
					);
				} else {
					await User.updateOne(
						{
							_id: decoded.id,
						},
						{
							emailConfirmed: true,
						}
					);
					res.status(201).send("Email verified successfully");
				}
			}
		);
	} catch (e) {
		res.status(500).send("server error: " + e.message);
	}
});

authRouter.post("/login", (req, res, next) => {
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
