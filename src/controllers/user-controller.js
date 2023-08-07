import User from "../model/User.js";

export const getUserById = async (req, res) => {
	const userId = req.params.id;
	console.log(userId);
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

		if (!user) {
			return res.status(404).json({ message: "User not found" });
		}

		res.status(200).json({ user: customUser });
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
				favoritesEpisodes: user.favoritesEpisodes,
				favoritesArticles: user.favoritesArticles,
			};

			return customUser;
		});

		res.status(200).json({ users: transformedUsers });
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "Server error" });
	}
};
