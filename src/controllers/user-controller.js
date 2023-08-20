import User from "../model/User.js";

export const statistics = async (req, res) => {
	try {
		const statistics = await User.aggregate([
			{
				$group: {
					_id: null,
					totalUsers: { $sum: 1 },
					activeUsers: {
						$sum: {
							$cond: [
								{ $eq: ["$status", "Active"] },
								1,
								0,
							],
						},
					},
					notActiveUsers: {
						$sum: {
							$cond: [
								{ $ne: ["$status", "Active"] },
								1,
								0,
							],
						},
					},
					googleUsers: {
						$sum: {
							$cond: [
								{ $ifNull: ["$google", false] },
								1,
								0,
							],
						},
					},
					facebookUsers: {
						$sum: {
							$cond: [
								{ $ifNull: ["$facebook", false] },
								1,
								0,
							],
						},
					},
					localUsers: {
						$sum: {
							$cond: [
								{ $ifNull: ["$local", false] },
								1,
								0,
							],
						},
					},
				},
			},
			{
				$project: {
					_id: 0,
					totalUsers: 1,
					activeUsers: 1,
					notActiveUsers: 1,
					localUsers: 1,
					googleUsers: 1,
					facebookUsers: 1,
				},
			},
		]);

		const userStats = statistics.length > 0 ? statistics[0] : null;

		res.status(200).json({ userStats });
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "Server error" });
	}
};

const getUser = async (userId) => {
	try {
		const user = await User.findById(userId)
			.select("id local google facebook role status createdAt")
			.populate({
				path: "favoritesEpisodes",
				select: "id episodeNumber title smallDescription notesDescription category image duration isPublished playCount",
				populate: {
					path: "category",
					select: "id title", // Select the fields you want to populate for the "category"
				},
			})
			.populate({
				path: "favoritesArticles",
				select: "id articleNumber title category image readTime isPublished readCount",
				populate: {
					path: "category",
					select: "id title", // Select the fields you want to populate for the "category"
				},
			});

		// Customize the user object to include the desired name and email fields
		const customUser = {
			id: user._id,
			name:
				user.google?.name ||
				user.local?.name ||
				user.facebook?.name,
			email:
				user.local?.email ||
				user.google?.email ||
				user.facebook?.email,
			username: user.local?.username || null,
			status: user.status,
			role: user.role,
			registeredAt: user.createdAt.toISOString().split("T")[0],
			favoritesEpisodes: user.favoritesEpisodes,
			favoritesArticles: user.favoritesArticles,
		};

		return customUser;
	} catch (error) {
		console.error(error);
		throw new Error(error);
	}
};

export const getUserProfile = async (req, res) => {
	const userId = req.user._id;
	console.log(userId);
	try {
		const user = await getUser(userId);

		if (!user) {
			return res.status(404).json({ message: "User not found" });
		}

		return res.status(200).json({ user });
	} catch (error) {
		console.error(error);
		return res.status(500).json({ message: "Server error" });
	}
};
export const getUserById = async (req, res) => {
	const userId = req.params.id;
	console.log(userId);
	try {
		const user = await getUser(userId);

		if (!user) {
			return res.status(404).json({ message: "User not found" });
		}

		res.status(200).json({ user });
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "Server error" });
	}
};

export const getAllUsers = async (req, res) => {
	const { search, status } = req.query;
	// Get the query parameters for search and status

	try {
		// Define the base query
		let query = User.find();

		// Apply search filter if provided
		if (search) {
			// Split the search query into individual words
			const searchWords = search
				.split(" ")
				.filter((word) => word !== "");

			// Create a regex pattern to match any of the search words in the episode title
			const regexPattern = searchWords
				.map((word) => `(?=.*${word})`)
				.join("");

			const regexQuery = new RegExp(regexPattern, "i");
			query = query.or([
				{ "local.name": { $regex: regexQuery } },
				{ "local.username": { $regex: regexQuery } },
				{ "google.name": { $regex: regexQuery } },
				{ "facebook.name": { $regex: regexQuery } },
			]);
		}

		// Apply status filter if provided
		if (status) {
			query = query.where("status").equals(status);
		}

		// Execute the query
		const users = await query.select(
			"id local.name local.username local.email google.name google.email facebook.name facebook.email role status createdAt"
		);

		// Customize the user object to include the desired name and email fields

		const transformedUsers = users.map((user) => {
			console.log(user);
			const customUser = {
				id: user._id,
				name:
					user.google?.name ||
					user.local?.name ||
					user.facebook?.name,
				email:
					user.local?.email ||
					user.google?.email ||
					user.facebook?.email,
				username: user.local?.username || null,
				status: user.status,
				role: user.role,
				registeredAt: user.createdAt.toISOString().split("T")[0],
			};

			return customUser;
		});

		res.status(200).json({ users: transformedUsers });
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "Server error" });
	}
};

export const toggleStatus = async (req, res, next) => {
	const _id = req.params.id;
	let user;
	user = await User.findById(_id);

	if (!user) {
		return res.status(404).json({ message: "User not found" });
	}

	// Toggle the status between "Active" and "Inactive"
	user.status = user.status === "Active" ? "Inactive" : "Active";

	try {
		await user.save();
		return res.status(200).json({
			message: "User status toggled successfully",
			newStatus: user.status,
		});
	} catch (err) {
		console.log(err);
		return res.status(500).json({ message: "Server error" });
	}
};

export const changePassword = async (req, res) => {
	const userId = req.user._id;
	const { oldPassword, newPassword } = req.body;

	try {
		// Find the user by their ID
		const user = await User.findById(userId);

		// If the user doesn't exist
		if (!user) {
			return res.status(404).json({ message: "User not found" });
		}

		// Change the password using Passport-Local-Mongoose's changePassword method
		user.changePassword(oldPassword, newPassword, function (err) {
			if (err) {
				// Handle incorrect password or other errors
				console.error(err);
				if (err.name === "IncorrectPasswordError") {
					return res
						.status(400)
						.json({ message: "Incorrect old password" });
				}
				return res
					.status(500)
					.json({ message: "Password change failed" });
			}

			// Password change was successful
			res.status(200).json({
				message: "Password changed successfully",
			});
		});
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "Server error" });
	}
};

export const updateUser = async (req, res, next) => {
	const userId = req.user._id;

	try {
		const user = await User.findById(userId);

		if (!user) {
			return res.status(404).json({ message: "User not found" });
		}

		const registrationMethod = req.user.method
			? req.user.method
			: "local";
		if (registrationMethod === "local") {
			if (req.body.hasOwnProperty("password")) {
				// Use the authenticate method to authenticate the user object
				user.authenticate(
					req.body.password,
					(err, user, errorInfo) => {
						if (err) {
							// An error occurred during authentication (e.g., incorrect password)
							console.error(err);
							return res
								.status(500)
								.json({ message: "Server error" });
						}

						if (!user) {
							// Authentication failed, user is not authenticated
							console.log("Authentication failed");
							return res.status(401).json({
								message: "Authentication failed",
							});
						}

						// Authentication successful
						console.log("Authentication successful");
					}
				);
			} else {
				return res.status(401).json({
					message: "password is missing",
				});
			}
		}

		delete req.body.password;
		updateUserFields(user, registrationMethod, req.body);

		await user.save();

		res.status(200).json({
			message: "User information updated successfully",
			user,
		});
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "Server error" });
	}
};

export const updateUserbyAdmin = async (req, res, next) => {
	const userId = req.params.id;

	try {
		const user = await User.findById(userId);

		if (!user) {
			return res.status(404).json({ message: "User not found" });
		}
		let registrationMethod;
		if (user.google.name) {
			registrationMethod = "google";
		} else if (user.facebook.name) {
			registrationMethod = "facebook";
		} else if (user.local.name) {
			registrationMethod = "local";
		}

		console.log(registrationMethod);

		updateUserFields(user, registrationMethod, req.body);

		await user.save();

		res.status(200).json({
			message: "User information updated successfully",
			user,
		});
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "Server error" });
	}
};

function updateUserFields(user, registrationMethod, updates) {
	const methodFields = {
		local: ["name", "username", "email"],
		google: ["name", "email"],
		facebook: ["name", "email"],
	};

	const fieldsToUpdate = methodFields[registrationMethod] || [];

	fieldsToUpdate.forEach((field) => {
		if (updates[field]) {
			user[registrationMethod][field] = updates[field];
		}
	});
}

export const deleteUser = async (req, res) => {
	const userId = req.params.id;

	try {
		const user = await User.findByIdAndRemove(userId);

		if (!user) {
			return res.status(404).json({ message: "User not found" });
		}

		res.status(200).json({ message: "User deleted successfully" });
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "Server error" });
	}
};
