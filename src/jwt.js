import jwt from "jsonwebtoken";
export const signToken = (user) => {
	return new Promise((resolve, reject) => {
		const customUser = {
			_id: user._id,
			name:
				user.google?.name ||
				user.local?.name ||
				user.facebook?.name,
			email:
				user.local?.email ||
				user.google?.email ||
				user.facebook?.email,
			username:
				user.google?.username ||
				user.local?.username ||
				user.facebook?.username,
			status: user.status,
			role: user.role,
			registeredAt: user.createdAt.toISOString().split("T")[0],
		};

		jwt.sign(
			{ user: customUser },
			process.env.JWT_SECRET_KEY,
			{ expiresIn: process.env.TOKEN_EXPIRATION_TIME },
			(err, token) => {
				if (err) {
					reject(err);
				} else {
					resolve(token);
				}
			}
		);
	});
};
