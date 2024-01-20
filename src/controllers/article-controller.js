import Article from "../model/Article.js";
import User from "../model/User.js";
import ReadHistory from "../model/ReadHistory.js";
import httpStatus from "http-status";
import pick from "../utils/pick.js";
import ApiError from "../utils/ApiError.js";
import catchAsync from "../utils/catchAsync.js";

import constructFilters from "../utils/filter.js";
import * as articleService from "../services/articles-service.js";

// this should be on its own route and controller read history
export const getReadHistory = async (req, res, next) => {
	try {
		const readHistory = await ReadHistory.find();

		// Return the most read articles as a response
		res.status(200).json({ readHistory });
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "Server error" });
	}
};

export const articlesStatistics = catchAsync(async (req, res) => {
	const articlesStatistics = await articleService.articlesStatistics();
	if (!articlesStatistics) {
		throw new ApiError(httpStatus.NOT_FOUND, "Statistics not found");
	}
	res.send(articlesStatistics);
});

// this should be on its own route and controller favorites
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

// this should be on its own route and controller favorites
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

// this should be on its own route and controller favorites
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
export const getMostReadArticles = catchAsync(async (req, res) => {
	// Get the limit from the query parameters, and set a default value if not provided
	const limit = req.query.limit ? parseInt(req.query.limit) : 6;
	const mostReadArticles = await articleService.MostReadArticles(limit);

	res.send(mostReadArticles);
});

export const getSimilairById = catchAsync(async (req, res) => {
	const articleId = req.params.id;
	const limit = req.query.limit ? parseInt(req.query.limit) : 6;
	const similairArticles = await articleService.similairArticles(
		articleId,
		limit
	);

	res.send(similairArticles);
});

export const getAllArticles = catchAsync(async (req, res, next) => {
	const filter = constructFilters(
		pick(req.query, [
			"isPublished",
			"search",
			"readTime",
			"startDate",
			"endDate",
			"category",
		])
	);
	const options = pick(req.query, ["limit", "page"]);
	options["populate"] = "category.title"; // Specify the fields you want to populate
	console.log(options);
	const result = await articleService.getAllArticles(filter, options);
	res.send(result);
});

// Add a new article
export const addArticle = catchAsync(async (req, res) => {
	const article = await articleService.createArticle(req.body);
	res.status(httpStatus.CREATED).send(article);
});

export const toggleIsPublished = catchAsync(async (req, res, next) => {
	const _id = req.params.id;
	const article = await articleService.toggleIsPublished(_id);
	if (!article) {
		throw new ApiError(httpStatus.NOT_FOUND, "Article not found");
	}

	res.status(httpStatus.NO_CONTENT).send();
});

export const updateArticle = catchAsync(async (req, res, next) => {
	const _id = req.params.id;
	const update = {};
	for (const key of Object.keys(req.body)) {
		if (req.body[key] !== "") {
			update[key] = req.body[key];
		}
	}

	const article = await articleService.updateArticle(_id, update);
	if (!article) {
		throw new ApiError(httpStatus.NOT_FOUND, "Article not found");
	}

	res.send(article);
});

// Get article by ID
export const getById = catchAsync(async (req, res, next) => {
	const { id } = req.params;
	const article = await articleService.getArticleById(id);

	if (!article) {
		throw new ApiError(httpStatus.NOT_FOUND, "Article not found");
	}

	res.send(article);
});

// Delete article by ID
export const deleteArticleById = catchAsync(async (req, res, next) => {
	const { id } = req.params;
	await articleService.deleteArticle(id);
	res.status(httpStatus.NO_CONTENT).send();
});

export const getLastArticleNumber = catchAsync(async (req, res) => {
	const article = await articleService.getLastArticleNumber();
	if (!article) {
		throw new ApiError(httpStatus.NOT_FOUND, "There is no articles");
	}
	res.send(article);
});
