import Group from "../model/Group.js";
import Category from "../model/Category.js";

export const statistics = async (req, res) => {
	try {
		const statistics = await Group.aggregate([
			{
				$lookup: {
					from: "categories",
					localField: "categories",
					foreignField: "_id",
					as: "categoryDetails",
				},
			},
			{
				$unwind: "$categoryDetails",
			},
			{
				$lookup: {
					from: "episodes",
					localField: "categoryDetails._id",
					foreignField: "category",
					as: "categoryEpisodes",
				},
			},
			{
				$lookup: {
					from: "articles",
					localField: "categoryDetails._id",
					foreignField: "category",
					as: "categoryArticles",
				},
			},
			{
				$group: {
					_id: "$_id",
					title: { $first: "$title" },
					numberOfCategories: { $sum: 1 },
					numberOfEpisodes: {
						$sum: { $size: "$categoryEpisodes" },
					},
					numberOfArticles: {
						$sum: { $size: "$categoryArticles" },
					},
					totalPlayCount: {
						$sum: { $sum: "$categoryEpisodes.playCount" },
					},
					totalReadCount: {
						$sum: "$categoryArticles.readCount",
					},
					totalComments: {
						$sum: {
							$sum: [
								{ $size: "$categoryEpisodes.comments" },
								{ $size: "$categoryArticles.comments" },
							],
						},
					},
				},
			},
			{
				$project: {
					_id: 0,
					title: 1,
					numberOfCategories: 1,
					numberOfEpisodes: 1,
					numberOfArticles: 1,
					totalPlayCount: 1,
					totalReadCount: 1,
					totalComments: 1,
				},
			},
		]);
		res.status(200).json(statistics);
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "Server error" });
	}
};

export const addGroup = async (req, res) => {
	try {
		const { title, description, categories } = req.body;
		const newGroup = await Group.create({
			title,
			description,
			categories,
		});
		const group = await newGroup.save();
		res.status(201).json(group);
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "Server error" });
	}
};

export const getGroups = async (req, res) => {
	try {
		const { search } = req.query; // Get the query parameter for search

		// Define the base aggregation pipeline
		let pipeline = [
			{
				$unwind: "$categories",
			},
			{
				$lookup: {
					from: "categories", // Replace 'categories' with the name of the categories collection
					localField: "categories",
					foreignField: "_id",
					as: "categoryDetails",
				},
			},
			{
				$unwind: "$categoryDetails",
			},
			{
				$lookup: {
					from: "articles", // Replace 'articles' with the name of the articles collection
					localField: "categoryDetails._id",
					foreignField: "category",
					as: "articles",
				},
			},
			{
				$lookup: {
					from: "episodes", // Replace 'episodes' with the name of the episodes collection
					localField: "categoryDetails._id",
					foreignField: "category",
					as: "episodes",
				},
			},
			{
				$group: {
					_id: "$_id",
					title: { $first: "$title" },
					description: { $first: "$description" },
					categories: {
						$push: {
							_id: "$categoryDetails._id",
							title: "$categoryDetails.title",
							image: "$categoryDetails.image",
							articleCount: { $size: "$articles" },
							episodeCount: { $size: "$episodes" },
						},
					},
				},
			},
			{
				$project: {
					_id: 1,
					title: 1,
					description: 1,
					categories: 1,
				},
			},
			{
				$sort: {
					createdAt: -1, // Sort by createdAt in descending order (-1)
				},
			},
		];

		// Apply search filter if provided
		if (search) {
			// Split the search query into individual words
			const searchWords = search
				.split(" ")
				.filter((word) => word !== "");

			// Create a regex pattern to match any of the search words in the episode title
			const regexPattern = searchWords
				.map((word) => `(?=.*${word})`)
				.join("|");

			const regexQuery = new RegExp(regexPattern, "i");
			pipeline = [
				...pipeline,
				{
					$match: {
						title: regexQuery,
					},
				},
			];
		}

		// Execute the aggregation
		const groups = await Group.aggregate(pipeline);

		res.status(200).json({ groups });
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "Server error" });
	}
};

export const getById = async (req, res) => {
	try {
		const group = await Group.findById(req.params.id)
			.select("id title description categories")
			.populate("categories", "id title image")
			.exec();
		if (!group) {
			return res.status(404).json({ message: "Group not found" });
		}
		res.status(200).json(group);
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "Server error" });
	}
};

export const updateGroup = async (req, res) => {
	const _id = req.params.id;
	const update = {};
	for (const key of Object.keys(req.body)) {
		if (req.body[key] !== "") {
			update[key] = req.body[key];
		}
	}

	Group.findOneAndUpdate({ _id }, { $set: update }, { new: true })
		.then((group) => {
			console.log("success");
			res.status(201).json({ message: "updated with success" });
		})
		.catch((err) => {
			console.log("err", err);
			res.status(500).send(err);
		});
};

export const deleteGroup = async (req, res) => {
	try {
		const group = await Group.findByIdAndDelete(req.params.id).exec();
		if (!group) {
			return res.status(404).json({ message: "Group not found" });
		}
		res.status(200).json({ message: "Group deleted successfully" });
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "Server error" });
	}
};

export const addCategory = async (req, res) => {
	const groupId = req.params.id;
	const categoryId = req.body.category;

	try {
		// Check if both group and category exist
		const group = await Group.findById(groupId);
		const category = await Category.findById(categoryId);

		if (!group || !category) {
			return res
				.status(404)
				.json({ message: "Group or category not found" });
		}

		// Add the category to the group's categories array
		group.categories.push(categoryId);
		await group.save();

		res.status(200).json({
			message: "Category added to group successfully",
		});
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "Server error" });
	}
};

export const deleteCategory = async (req, res) => {
	const groupId = req.params.id;
	const categoryId = req.body.category;

	try {
		// Check if both group and category exist
		const group = await Group.findById(groupId);
		const category = await Category.findById(categoryId);

		if (!group || !category) {
			return res
				.status(404)
				.json({ message: "Group or category not found" });
		}

		// Remove the category from the group's categories array
		group.categories.pop(categoryId);
		await group.save();

		res.status(200).json({
			message: "Category removed from group successfully",
		});
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "Server error" });
	}
};
