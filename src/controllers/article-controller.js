import Article from "../model/Article.js";
import Category from "../model/Category.js";
import Comment from "../model/Comment.js";
import { getUser } from "./getUser.js";
import mongoose from "mongoose";
import { ObjectId } from "mongodb";
import User from "../model/User.js";

export const articlesStatistics = async (req, res) => {
	try {
		const statistics = await Article.aggregate([
			{
				$group: {
					_id: null,
					totalArticle: { $sum: 1 },
					publishedArticle: {
						$sum: {
							$cond: [
								{ $eq: ["$isPublished", true] },
								1,
								0,
							],
						},
					},
					notPublishedArticle: {
						$sum: {
							$cond: [
								{ $eq: ["$isPublished", false] },
								1,
								0,
							],
						},
					},
					totalReadCount: { $sum: "$readCount" },
					totalComments: {
						$sum: {
							$size: {
								$ifNull: ["$comments", []],
							},
						},
					},

					// Add more statistics fields here
				},
			},

			{
				$project: {
					_id: 0, // Exclude the _id field from the result
					totalArticle: 1,
					publishedArticle: 1,
					notPublishedArticle: 1,
					totalReadCount: 1,
					totalComments: 1,

					// Add more fields to include in the result
				},
			},
		]);

		if (statistics.length === 0) {
			return res.status(404).json({ message: "No statistics found" });
		}

		const episodeStatistics = statistics[0];
		res.status(200).json(episodeStatistics);
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "Server error" });
	}
};

export const checkUserFavorites = async (req, res) => {
	try {
		const articleId = req.params.articleId;
		const userId = req.user._id;

		// Check if the user has favorited the article
		const user = await User.findById(userId).select("favoritesArticles");

		// Extract the favoritesArticles array from the user object
		const favoritesArticles = user ? user.favoritesArticles : [];

		const isFavorited = favoritesArticles
			? favoritesArticles.some((article) => article.equals(articleId))
			: false;

		res.status(200).json({ isFavorited });
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "Server error" });
	}
};

export const addToFavoritesArticle = async (req, res) => {
	try {
		const userId = req.user._id;
		const articleId = req.params.articleId;

		const user = await User.findById(userId);

		// Check if the article exists in the database
		const article = await Article.findById(articleId);
		if (!article) {
			return res.status(404).json({ message: "Article not found" });
		}

		// Check if the article already exists in the favorites list
		if (!user.favoritesArticles.includes(articleId)) {
			user.favoritesArticles.push(articleId);
			await user.save();
		}

		res.status(200).json({
			message: "Article added to favorites successfully",
		});
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "Server error" });
	}
};

// Endpoint to delete an article from favorites
export const deleteFromFavoritesArticle = async (req, res) => {
	const articleId = req.params.articleId;
	const userId = req.user._id;

	try {
		// Check if the article exists in the favorites of the user
		const user = await User.findById(userId);
		if (!user.favoritesArticles.includes(articleId)) {
			return res
				.status(404)
				.json({ message: "Article not found in favorites" });
		}

		// Remove the article from favorites
		user.favoritesArticles.pull(articleId);
		await user.save();

		res.status(200).json({
			message: "Article removed from favorites successfully",
		});
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "Server error" });
	}
};

// Controller function to get the most read articles
export const getMostReadArticles = async (req, res) => {
	try {
		// Get the limit from the query parameters, and set a default value if not provided
		const limit = req.query.limit ? parseInt(req.query.limit) : 6;

		// Use the find method to get the articles, sorted by readCount in descending order, and limit to the specified number of results
		const mostReadArticles = await Article.find()
			.select(
				"id articleNumber title description image readTime isPublished category createdAt readCount"
			)
			.populate("category", "id title")
			.sort({ readCount: -1 })
			.limit(limit);

		// Return the most read articles as a response
		res.status(200).json({ articles: mostReadArticles });
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "Server error" });
	}
};

export const getSimilairById = async (req, res) => {
	const articleId = req.params.id;
	const limit = req.query.limit ? parseInt(req.query.limit) : 6;
	try {
		// Find the article by ID to get its title and category
		const article = await Article.findById(articleId).select("title");

		if (!article) {
			return res.status(404).json({ message: "Article not found" });
		}

		const articleTitle = article.title;
		const searchWords = articleTitle
			.split(" ")
			.filter((word) => word !== "");

		// Create a regex pattern to match any of the search words in the article title
		const regexPattern = searchWords
			.map((word) => `(?=.*${word})`)
			.join("");

		const regexQuery = new RegExp(regexPattern, "i");
		// Find similar articles in the same category based on similar titles
		const similarArticles = await Article.find({
			_id: { $ne: articleId }, // Exclude the current article from the results
			title: { $regex: regexQuery }, // Case-insensitive search for similar titles
		})
			.limit(limit)
			.select(
				"id articleNumber title description image readTime isPublished category createdAt readCount"
			)
			.populate("category", "id title")
			.sort({ createdAt: -1 })
			.exec();

		return res.status(200).json({ similarArticles });
	} catch (error) {
		console.log(error);
		return res.status(500).json({ message: "Server error" });
	}
};

export const getAllArticles = async (req, res, next) => {
	const { isPublished, search, readTime, startDate, endDate, category } =
		req.query;
	let page = parseInt(req.query.page);
	let limit = parseInt(req.query.limit);

	if (!page || page < 1) {
		page = 1;
	}
	if (!limit || limit < 1) {
		limit = 6;
	}

	const filter = {};
	if (isPublished) {
		filter.isPublished = isPublished === "1";
	}
	if (category) {
		filter.category = category;
	}
	if (readTime) {
		const { minTime, maxTime } = readTimeCategory(parseInt(readTime));
		filter.readTime = { $gte: minTime, $lte: maxTime };
	}
	if (startDate && endDate) {
		filter.createdAt = {
			$gte: new Date(startDate),
			$lte: new Date(endDate),
		};
	} else if (startDate) {
		filter.createdAt = { $gte: new Date(startDate) };
	} else if (endDate) {
		filter.createdAt = { $lte: new Date(endDate) };
	}
	if (search) {
		// Split the search query into individual words
		const searchWords = search.split(" ").filter((word) => word !== "");

		// Create a regex pattern to match any of the search words in the article title
		const regexPattern = searchWords
			.map((word) => `(?=.*${word})`)
			.join("|");

		const regexQuery = new RegExp(regexPattern, "i");

		filter.$or = [{ title: regexQuery }];
	}

	try {
		const articles = await Article.find(filter)
			.select(
				"id articleNumber title description image readTime isPublished category createdAt readCount"
			)
			.limit(limit)
			.skip((page - 1) * limit)
			.populate("category", "id title")
			.sort({ createdAt: -1 });

		const count = await Article.countDocuments(filter);

		const totalPages = Math.ceil(count / limit);

		const formattedArticles = articles.map((article) => {
			const createdAt = article.createdAt.toISOString().split("T")[0];
			return { ...article._doc, createdAt };
		});

		res.status(200).json({ totalPages, articles: formattedArticles });
	} catch (error) {
		console.log(error);
		res.status(500).json({ message: "Server error" });
	}
};

const readTimeCategory = (readTimeCategoryNumber) => {
	let minDuration, maxDuration;

	switch (readTimeCategoryNumber) {
		case 0:
			minDuration = 0;
			maxDuration = 10;
			break;
		case 1:
			minDuration = 11;
			maxDuration = 20;
			break;
		case 2:
			minDuration = 21;
			maxDuration = 30;
			break;
		case 3:
			minDuration = 31;
			maxDuration = 60;
			break;
		default:
			// For any other number, assume less than 15 minutes
			minDuration = 0;
			maxDuration = 600;
			break;
	}

	return { minDuration, maxDuration };
};

// Add a new article
export const addArticle = async (req, res, next) => {
	const {
		articleNumber,
		title,
		description,
		content,
		image,
		readTime,
		category,
	} = req.body;
	console.log(image);
	let existingCategory;
	try {
		// Validate the categoryId
		if (!mongoose.Types.ObjectId.isValid(category)) {
			return res.status(400).json({ message: "Invalid categoryId" });
		}

		existingCategory = await Category.findById(category);
	} catch (error) {
		return console.log(error);
	}

	if (!existingCategory) {
		return res.status(404).json({ message: "category not found" });
	}

	const article = new Article({
		articleNumber,
		title,
		description,
		content,
		image,
		readTime,
		category,
	});

	try {
		const newArticle = await article.save();
		res.status(201).json({ article: newArticle });
	} catch (error) {
		console.log(error);
		res.status(500).json({ message: "Server error" });
	}
};

export const toggleIsPublished = async (req, res, next) => {
	const _id = req.params.id;
	let article;
	try {
		article = await Article.findOneAndUpdate({ _id }, [
			{ $set: { isPublished: { $eq: [false, "$isPublished"] } } },
		]);
	} catch (err) {
		console.log(err);
		return res.status(500).json({ message: "Server error" });
	}

	if (!article) {
		return res.status(404).json({ message: "Article not found" });
	}

	res.status(200).json({ success: true });
};

export const updateArticle = async (req, res, next) => {
	const _id = req.params.id;
	const update = {};
	for (const key of Object.keys(req.body)) {
		if (req.body[key] !== "") {
			update[key] = req.body[key];
		}
	}

	Article.findOneAndUpdate({ _id }, { $set: update }, { new: true })
		.then((article) => {
			console.log("success");
			res.status(201).json({ message: "updated with success" });
		})
		.catch((err) => {
			console.log("err", err);
			res.status(500).send(err);
		});
};

// Get article by ID
export const getById = async (req, res, next) => {
	const { id } = req.params;
	try {
		// Assuming this is inside an async function
		const article = await Article.findById(id)
			.select(
				"id articleNumber title description content image readTime isPublished category comments createdAt readCount"
			)
			.populate({
				path: "category",
				select: "id title", // Select the fields you want to populate for the "category"
			})
			.populate({
				path: "comments",
				select: "id content user createdAt updatedAt",
				options: { sort: { createdAt: -1 } },
				populate: {
					path: "user",
					model: "User", // This should match the model name "User" defined in the user schema
					select: {
						id: 1,
						name: {
							$cond: [
								{ $ifNull: ["$local.name", false] },
								"$local.name",
								{
									$cond: [
										{
											$ifNull: [
												"$google.name",
												false,
											],
										},
										"$google.name",
										"$facebook.name",
									],
								},
							],
						},
						username: {
							$cond: [
								{ $ifNull: ["$local.username", false] },
								"$local.username",
								{
									$cond: [
										{
											$ifNull: [
												"$google.username",
												false,
											],
										},
										"$google.username",
										"$facebook.username",
									],
								},
							],
						},
					},
				},
			})

			.lean();

		if (!article) {
			return res.status(404).json({ message: "Article not found" });
		}
		const result = await Article.updateOne(
			{ _id: id }, // Query: Find the article by its ID
			{ $inc: { readCount: 1 } } // Update: Increment the readCount field by 1
		);

		res.status(200).json({ article });
	} catch (error) {
		console.log(error);
		res.status(500).json({ message: "Server error" });
	}
};

// Delete article by ID
export const deleteArticleById = async (req, res, next) => {
	const { id } = req.params;
	try {
		const article = await Article.findByIdAndDelete(id);
		if (!article) {
			return res.status(404).json({ message: "Article not found" });
		}
		res.status(200).json({ message: "Delete successful" });
	} catch (error) {
		console.log(error);
		res.status(500).json({ message: "Server error" });
	}
};

export const getLastArticleNumber = async (req, res) => {
	let article;
	try {
		article = await Article.find()
			.select(
				"id articleNumber title description image readTime isPublished category createdAt readCount"
			)
			// We multiply the "limit" variables by one just to make sure we pass a number and not a string
			.limit(1)

			// We sort the data by the date of their creation in descending order (user 1 instead of -1 to get ascending order)
			.sort({ articleNumber: -1 })

			.exec();
	} catch (error) {
		res.status(404).json({ message: "Error when getting article" });
	}
	if (!article) {
		res.status(404).json({ message: "No Article Found" });
	}

	return res.status(200).json(article);
};

export const addComment = async (req, res) => {
	const articleId = req.params.id;
	const { content } = req.body;
	const user = req.user._id;
	let existingArticle;
	try {
		// Validate the categoryId
		if (!mongoose.Types.ObjectId.isValid(articleId)) {
			return res.status(400).json({ message: "Invalid articleId" });
		}

		existingArticle = await Article.findById(articleId);
	} catch (error) {
		return console.log(error);
	}

	if (!existingArticle) {
		return res.status(404).json({ message: "article not found" });
	}

	// Loop through the comments array and create comment documents

	const commentDocument = new Comment({
		content,
		user,
	});
	let commentId;
	try {
		// Save the comment document
		const savedComment = await commentDocument.save();
		// Push the comment ID to the array
		commentId = savedComment._id;
	} catch (error) {
		console.log(error);
		return res.status(500).json({ message: "Adding comments failed" });
	}

	existingArticle.comments.push(commentId);

	try {
		await existingArticle.save();
	} catch (error) {
		console.log(error);
		return res
			.status(500)
			.json({ message: "adding comment to article failed" });
	}

	return res.status(200).json({ article: existingArticle });
};

export const deleteComment = async (req, res, next) => {
	const id = req.params.id;
	const commentId = req.params.commentId;
	const user = req.user;
	console.log(user);
	let article;
	let comment;
	try {
		article = await Article.findById(id);
	} catch (error) {
		return console.log(error);
	}

	if (!article) {
		return res.status(404).json({ message: "article not found" });
	}

	try {
		comment = await Comment.findById(commentId);
	} catch (error) {
		return console.log(error);
	}

	if (!comment) {
		return res.status(404).json({ message: "comment not found" });
	}

	const userId = new ObjectId(user._id);

	if (!comment.user.equals(userId) && user.role !== "admin") {
		console.log("we are in controller");
		return res.status(401).json({ message: "Unauthorized" });
	}
	article.comments.pop(comment._id);

	await article.save();

	return res.status(200).json({ message: "succesfelly deleted" });
};
