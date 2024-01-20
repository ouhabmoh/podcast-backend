import Article from "../model/Article.js";
import Category from "../model/Category.js";
import ApiError from "../utils/ApiError.js";
import httpStatus from "http-status";

export const getAllArticles = async (filters, options) => {
	const articles = await Article.paginate(filters, options);
	return articles;
};

/**
 * Create a user
 * @param {Object} userBody
 * @returns {Promise<Article>}
 */
export const createArticle = async (artcileBody) => {
	if (!(await Category.findById(artcileBody.category))) {
		throw new ApiError(httpStatus.BAD_REQUEST, "Category Doesnt Exist");
	}
	return Article.create(artcileBody);
};

export const deleteArticle = async (articleId) => {
	await Article.findByIdAndDelete(articleId);
	return;
};

export const updateArticle = async (_id, updates) => {
	const article = await Article.findOneAndUpdate(
		{ _id },
		{ $set: updates },
		{ new: true }
	);
	return article;
};

export const similairArticles = async (articleId, limit) => {
	// Find the article by ID to get its title and category
	const article = await Article.findById(articleId).select("title");

	if (!article) {
		throw new ApiError(httpStatus.BAD_REQUEST, "Article Doesnt Exist");
	}
	const articleTitle = article.title;
	const searchWords = articleTitle.split(" ").filter((word) => word !== "");

	// Create a regex pattern to match any of the search words in the article title
	const regexPattern = searchWords.map((word) => `(?=.*${word})`).join("|");

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

	return similarArticles;
};

export const articlesStatistics = async () => {
	const statistics = await Article.aggregate([
		{
			$group: {
				_id: null,
				totalArticle: { $sum: 1 },
				publishedArticle: {
					$sum: {
						$cond: [{ $eq: ["$isPublished", true] }, 1, 0],
					},
				},
				notPublishedArticle: {
					$sum: {
						$cond: [{ $eq: ["$isPublished", false] }, 1, 0],
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

	return statistics[0];
};

export const MostReadArticles = async (limit) => {
	// Use the find method to get the articles, sorted by readCount in descending order, and limit to the specified number of results
	const mostReadArticles = await Article.find()
		.select(
			"id articleNumber title description image readTime isPublished category createdAt readCount"
		)
		.populate("category", "id title")
		.sort({ readCount: -1 })
		.limit(limit);
	return mostReadArticles;
};

export const toggleIsPublished = async (_id) => {
	const article = await Article.findOneAndUpdate({ _id }, [
		{ $set: { isPublished: { $eq: [false, "$isPublished"] } } },
	]);

	return article;
};

export const getArticleById = async (articleId) => {
	const article = await Article.findById(articleId)
		.select(
			"id articleNumber title description content image readTime isPublished category comments createdAt writerName writerImage readCount"
		)
		.populate({
			path: "category",
			select: "id title",
		})
		.lean();

	// if (!article) {
	// 	throw new ApiError("Article not found");
	// }

	// const result = await Article.updateOne(
	// 	{ _id: articleId },
	// 	{ $inc: { readCount: 1 } }
	// );

	// const currentDate = new Date();
	// currentDate.setHours(0, 0, 0, 0);

	// await ReadHistory.findOneAndUpdate(
	// 	{ date: currentDate },
	// 	{ $inc: { readCount: 1 } },
	// 	{ upsert: true }
	// );

	return article;
};

export const getLastArticleNumber = async () => {
	const article = await Article.find()
		.select("articleNumber")
		// We multiply the "limit" variables by one just to make sure we pass a number and not a string
		.limit(1)

		// We sort the data by the date of their creation in descending order (user 1 instead of -1 to get ascending order)
		.sort({ articleNumber: -1 })

		.exec();

	return article;
};
