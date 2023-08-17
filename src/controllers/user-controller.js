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
			.populate(
				"favoritesEpisodes",
				"id episodeNumber title image duration isPublished playCount"
			)
			.populate(
				"favoritesArticles",
				"id articleNumber title image readTime isPublished readCount"
			);

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

		res.status(200).json({ user });
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "Server error" });
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
	try {
		const users = await User.find().select(
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
	try {
		user = await User.findOneAndUpdate({ _id }, [
			{ $set: { status: { $eq: [false, "$status"] } } },
		]);
	} catch (err) {
		console.log(err);
		return res.status(500).json({ message: "Server error" });
	}

	if (!user) {
		return res.status(404).json({ message: "User not found" });
	}

	res.status(200).json({ success: true });
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
		const registrationMethod = req.user.method
			? req.user.method
			: "local";
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
