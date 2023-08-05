import Group from "../model/Group.js";
import Category from "../model/Category.js";

export const addGroup = async (req, res) => {
	try {
		const { title, description, categories } = req.body;
		const newGroup = await Group.create({
			title,
			description,
			categories,
		});
		res.status(201).json(newGroup);
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "Server error" });
	}
};

export const getGroups = async (req, res) => {
	try {
		const groups = await Group.aggregate([
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
		]);
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
