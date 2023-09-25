import Article from "../model/Article.js";
import Category from "../model/Category.js";
import Comment from "../model/Comment.js";
import { ObjectId } from "mongodb";
import User from "../model/User.js";
import ReadHistory from "../model/ReadHistory.js";

// Function to get articles statistics
export const getArticlesStatistics = async () => {
	try {
		const statistics = await Article.aggregate([
			// Your aggregation pipeline stages here
		]);

		if (statistics.length === 0) {
			throw new Error("No statistics found");
		}

		const episodeStatistics = statistics[0];
		return episodeStatistics;
	} catch (error) {
		throw new Error("Server error");
	}
};

// Function to check if a user has favorited an article
export const checkUserFavorites = async (userId, articleId) => {
	try {
		const user = await User.findById(userId).select("favoritesArticles");
		const favoritesArticles = user ? user.favoritesArticles : [];

		const isFavorited = favoritesArticles
			? favoritesArticles.some((article) => article.equals(articleId))
			: false;

		return isFavorited;
	} catch (error) {
		throw new Error("Server error");
	}
};

// Function to add an article to a user's favorites
export const addToFavoritesArticle = async (userId, articleId) => {
	try {
		const user = await User.findById(userId);

		const article = await Article.findById(articleId);
		if (!article) {
			throw new Error("Article not found");
		}

		if (!user.favoritesArticles.includes(articleId)) {
			user.favoritesArticles.push(articleId);
			await user.save();
		}

		return "Article added to favorites successfully";
	} catch (error) {
		throw new Error("Server error");
	}
};

// Function to delete an article from user's favorites
export const deleteFromFavoritesArticle = async (userId, articleId) => {
	try {
		const user = await User.findById(userId);
		if (!user.favoritesArticles.includes(articleId)) {
			throw new Error("Article not found in favorites");
		}

		user.favoritesArticles.pull(articleId);
		await user.save();

		return "Article removed from favorites successfully";
	} catch (error) {
		throw new Error("Server error");
	}
};

// Function to get the most read articles
export const getMostReadArticles = async (limit) => {
	try {
		const mostReadArticles = await Article.find()
			.select(
				"id articleNumber title description image readTime isPublished category createdAt readCount"
			)
			.populate("category", "id title")
			.sort({ readCount: -1 })
			.limit(limit);

		return mostReadArticles;
	} catch (error) {
		throw new Error("Server error");
	}
};

// Function to get similar articles by ID
export const getSimilarById = async (articleId, limit) => {
	try {
		// Your logic to find similar articles here
	} catch (error) {
		throw new Error("Server error");
	}
};

// Function to get all articles with filtering options
export const getAllArticles = async (filterOptions) => {
	try {
		// Your logic to retrieve filtered articles here
	} catch (error) {
		throw new Error("Server error");
	}
};

// Function to add a new article
export const addArticle = async (articleData) => {
	try {
		// Your logic to add a new article here
	} catch (error) {
		throw new Error("Server error");
	}
};

// Function to toggle the "isPublished" status of an article
export const toggleIsPublished = async (articleId) => {
	try {
		// Your logic to toggle the status here
	} catch (error) {
		throw new Error("Server error");
	}
};

// Function to update an article
export const updateArticle = async (articleId, updateData) => {
	try {
		// Your logic to update an article here
	} catch (error) {
		throw new Error("Server error");
	}
};

// Function to get an article by ID
export const getArticleById = async (articleId) => {
	try {
		// Your logic to get an article by ID here
	} catch (error) {
		throw new Error("Server error");
	}
};

// Function to delete an article by ID
export const deleteArticleById = async (articleId) => {
	try {
		// Your logic to delete an article by ID here
	} catch (error) {
		throw new Error("Server error");
	}
};

// Function to get the last article number
export const getLastArticleNumber = async () => {
	try {
		// Your logic to get the last article number here
	} catch (error) {
		throw new Error("Server error");
	}
};

// Function to add a comment to an article
export const addCommentToArticle = async (articleId, commentData) => {
	try {
		// Your logic to add a comment to an article here
	} catch (error) {
		throw new Error("Server error");
	}
};

// Function to delete a comment from an article
export const deleteCommentFromArticle = async (
	articleId,
	commentId,
	userId
) => {
	try {
		// Your logic to delete a comment from an article here
	} catch (error) {
		throw new Error("Server error");
	}
};
