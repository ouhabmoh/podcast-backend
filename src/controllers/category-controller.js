import Category from "../model/Category.js";
import Episode from "../model/Episode.js";
import Article from "../model/Article.js";
import User from "../model/User.js";
import Note from "../model/Note.js";
import { getAudioDurationInSeconds } from "get-audio-duration";
import mongoose from "mongoose";

export const getAllCategories = async (req, res, next) => {
	const { search } = req.query;

	let categories;
	try {
		let filter;
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
			filter = { title: { $regex: regexQuery } };
		} else {
			filter = {};
		}
		categories = await Category.aggregate([
			{
				$match: filter,
			},
			{
				$lookup: {
					from: "articles", // Replace 'articles' with the name of the articles collection
					localField: "_id",
					foreignField: "category",
					as: "articles",
				},
			},
			{
				$lookup: {
					from: "episodes", // Replace 'episodes' with the name of the episodes collection
					localField: "_id",
					foreignField: "category",
					as: "episodes",
				},
			},
			{
				$addFields: {
					articleCount: { $size: "$articles" },
					episodeCount: { $size: "$episodes" },
				},
			},
			{
				$project: {
					_id: 1,
					title: 1,
					description: 1,
					image: 1,
					createdAt: {
						$dateToString: {
							format: "%Y-%m-%d",
							date: "$createdAt",
						},
					},
					isPublished: 1,
					articleCount: 1,
					episodeCount: 1,
				},
			},
		]);
	} catch (error) {
		console.log(error);
		return res.status(500).json({ message: "Server error" });
	}
	if (!categories) {
		return res.status(404).json({ message: "No Categories Found" });
	}

	res.status(200).json({ categories });
};

export const addCategory = async (req, res, next) => {
	const { title, description, image } = req.body;

	const category = new Category({ title, description, image });

	try {
		await category.save();
	} catch (error) {
		console.log(error);
		res.status(500).json({ message: "Server error" });
	}

	res.status(201).json({ category });
};

export const updateCategory = async (req, res, next) => {
	const _id = req.params.id;
	const update = {};
	for (const key of Object.keys(req.body)) {
		if (req.body[key] !== "") {
			update[key] = req.body[key];
		}
	}

	Category.findOneAndUpdate({ _id }, { $set: update }, { new: true })
		.then((category) => {
			console.log("success");
			res.status(201).json({ message: "updated with success" });
		})
		.catch((err) => {
			console.log("err", err);
			res.status(500).send(err);
		});
};

export const toggleIsPublished = async (req, res, next) => {
	const _id = req.params.id;
	let category;
	try {
		category = await Category.findOneAndUpdate({ _id }, [
			{ $set: { isPublished: { $eq: [false, "$isPublished"] } } },
		]);
	} catch (err) {
		console.log(err);
		return res.status(500).json({ message: "Server error" });
	}

	if (!category) {
		return res.status(404).json({ message: "Category not found" });
	}

	res.status(200).json({ success: true });
};

export const getById = async (req, res, next) => {
	const _id = req.params.id;
	let category;
	try {
		category = await Category.findById(_id).select(
			"id title description image isPublished createdAt"
		);
		if (!category) {
			return res.status(404).json({ message: "Category not found" });
		}
	} catch (error) {
		console.log(error);
		return res.status(500).json({ message: "Server error" });
	}
	const createdAt = category.createdAt.toISOString().split("T")[0];
	category = { ...category._doc, createdAt };

	let episodes;
	console.log(req.query);
	const {
		isPublishedEpisode,
		searchEpisode,
		durationEpisode,
		startDateEpisode,
		endDateEpisode,
	} = req.query;

	let page = parseInt(req.query.pageEpisode);
	let limit = parseInt(req.query.limitEpisode);
	if (!page || page < 1) {
		page = 1;
	}
	if (!limit || limit < 1) {
		limit = 6;
	}
	console.log(page, limit);
	let count;

	// Prepare the filter object based on query parameters
	const filterEpisode = {};

	filterEpisode.category = _id;

	if (isPublishedEpisode) {
		filterEpisode.isPublished = isPublishedEpisode === "1"; // Convert string to boolean
	}

	if (durationEpisode) {
		const { minDuration, maxDuration } = durationCategory(
			parseInt(durationEpisode)
		);
		console.log(minDuration, maxDuration);
		filterEpisode.duration = { $gte: minDuration, $lte: maxDuration };
	}
	if (startDateEpisode && endDateEpisode) {
		filterEpisode.createdAt = {
			$gte: new Date(startDateEpisode),
			$lte: new Date(endDateEpisode),
		};
	} else if (startDateEpisode) {
		filterEpisode.createdAt = { $gte: new Date(startDateEpisode) };
	} else if (endDateEpisode) {
		filterEpisode.createdAt = { $lte: new Date(endDateEpisode) };
	}

	// Check if the search parameter is provided
	if (searchEpisode) {
		// Create the regex pattern for case-insensitive search
		const searchRegex = new RegExp(searchEpisode, "i");

		// Add the $or operator to search for the title or description
		filterEpisode.$or = [
			{ title: searchRegex },
			{ description: searchRegex },
		];
	}

	console.log(filterEpisode);
	try {
		episodes = await Episode.find(filterEpisode)
			.select(
				"id episodeNumber title image duration createdAt isPublished"
			)
			// We multiply the "limit" variables by one just to make sure we pass a number and not a string
			.limit(limit * 1)
			// I don't think i need to explain the math here
			.skip((page - 1) * limit)
			// We sort the data by the date of their creation in descending order (user 1 instead of -1 to get ascending order)
			.sort({ createdAt: -1 })

			.exec();
		// Getting the numbers of products stored in database
		count = await Episode.countDocuments(filterEpisode);
	} catch (error) {
		return res
			.status(404)
			.json({ message: "Error when getting episodes" });
	}
	// if(!episodes){
	//     res.status(404).json({message : "No Episodes Found"});
	// }
	const formattedEpisodes = episodes.map((episode) => {
		const createdAt = episode.createdAt.toISOString().split("T")[0];
		return { ...episode._doc, createdAt };
	});
	console.log(formattedEpisodes);

	const {
		isPublishedArticle,
		searchArticle,
		readTime,
		startDateArticle,
		endDateArticle,
	} = req.query;
	page = parseInt(req.query.pageArticle);
	limit = parseInt(req.query.limitArticle);

	if (!page || page < 1) {
		page = 1;
	}
	if (!limit || limit < 1) {
		limit = 6;
	}

	const filterArticle = {};
	filterArticle.category = _id;
	if (isPublishedArticle) {
		filterArticle.isPublished = isPublishedArticle === "1";
	}
	//   if (readTime) {
	//     const { minTime, maxTime } = readTimeCategory(parseInt(readTime));
	//     filter.readTime = { $gte: minTime, $lte: maxTime };
	//   }
	if (startDateArticle && endDateArticle) {
		filterArticle.createdAt = {
			$gte: new Date(startDateArticle),
			$lte: new Date(endDateArticle),
		};
	} else if (startDateArticle) {
		filterArticle.createdAt = { $gte: new Date(startDateArticle) };
	} else if (endDateArticle) {
		filterArticle.createdAt = { $lte: new Date(endDateArticle) };
	}
	if (searchArticle) {
		const searchRegex = new RegExp(searchArticle, "i");
		filterArticle.$or = [{ title: searchRegex }];
	}
	let formattedArticles;
	let totalPages;
	try {
		const articles = await Article.find(filterArticle)
			.select(
				"id articleNumber title description image readTime isPublished category createdAt readCount"
			)
			.limit(limit)
			.skip((page - 1) * limit)
			.sort({ createdAt: -1 });

		const count = await Article.countDocuments(filterArticle);
		totalPages = Math.ceil(count / limit);

		formattedArticles = articles.map((article) => {
			const createdAt = article.createdAt.toISOString().split("T")[0];
			return { ...article._doc, createdAt };
		});
	} catch (error) {
		console.log(error);
		res.status(500).json({ message: "Server error" });
	}

	return res.status(200).json({
		category,
		episodes: {
			totalPages: Math.ceil(count / limit),
			list: formattedEpisodes,
		},
		articles: { totalPages, list: formattedArticles },
	});
};

export const deleteCategoryById = async (req, res, next) => {
	const id = req.params.id;

	try {
		const category = await Category.findByIdAndRemove(id);
		if (!category) {
			return res.status(404).json({ message: "Category not found" });
		}

		res.status(200).json({ message: "Category deleted successfully" });
	} catch (error) {
		console.log(error);
		res.status(500).json({ message: "Server error" });
	}
};

export const getCategoryEpisodes = async (req, res) => {
	const categoryId = req.params.id;
	console.log(categoryId);
	// Check if categoryId is a valid ObjectId
	if (!mongoose.Types.ObjectId.isValid(categoryId)) {
		return res.status(400).json({ message: "Invalid category ID" });
	}

	let episodes;
	let page = parseInt(req.query.page);
	let limit = parseInt(req.query.limit);
	if (!page || page < 1) {
		page = 1;
	}
	if (!limit || limit < 1) {
		limit = 6;
	}
	let count;
	try {
		episodes = await Episode.find({
			category: categoryId,
			isPublished: true,
		})
			.select(
				"id episodeNumber title category image duration createdAt"
			)
			// We multiply the "limit" variables by one just to make sure we pass a number and not a string
			.limit(limit * 1)
			// I don't think i need to explain the math here
			.skip((page - 1) * limit)
			// We sort the data by the date of their creation in descending order (user 1 instead of -1 to get ascending order)
			.sort({ createdAt: -1 })
			.populate("category", "id title")
			.exec();
		// Getting the numbers of products stored in database
		count = await Episode.countDocuments();
	} catch (error) {
		res.status(404).json({ message: "Error when getting episodes" });
	}
	if (!episodes) {
		res.status(404).json({ message: "No Episodes Found" });
	}
	const formattedEpisodes = episodes.map((episode) => {
		const createdAt = episode.createdAt.toISOString().split("T")[0];
		return { ...episode._doc, createdAt };
	});

	return res.status(200).json({
		totalPages: Math.ceil(count / limit),
		episodes: formattedEpisodes,
	});
};
