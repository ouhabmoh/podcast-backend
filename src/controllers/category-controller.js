import Category from "../model/Category.js";
import Episode from "../model/Episode.js";
import Article from "../model/Article.js";
import mongoose from "mongoose";

// categories.controller.js
import { catchAsync } from "../utils/catchAsync.js";
import categoryService from "../services/categories-service.js";
import httpStatus from "http-status";
import pick from "../utils/pick.js";
import ApiError from "../utils/ApiError.js";
import catchAsync from "../utils/catchAsync.js";

import constructFilters from "../utils/filter.js";

export const getAllCategories = catchAsync(async (req, res) => {
	const { search } = req.query;
	const filters = {};
	if (search) {
		const searchWords = search.split(" ").filter((word) => word !== "");
		const regexPattern = searchWords.map((word) => `(${word})`).join("|");
		const regexQuery = new RegExp(regexPattern, "i");
		filters[title] = { $regex: regexQuery };
	}
	const result = await categoryService.getAllCategories(filters, options);
	res.send(result);
});

export const addCategory = catchAsync(async (req, res) => {
	const category = await categoryService.createCategory(req.body);
	res.status(httpStatus.CREATED).send(category);
});

export const updateCategory = catchAsync(async (req, res) => {
	const { id } = req.params;
	const updates = req.body;

	const category = await categoryService.updateCategory(id, updates);
	if (!category) {
		throw new ApiError(httpStatus.NOT_FOUND, "Category not found");
	}

	res.send(category);
});

export const removeCategory = catchAsync(async (req, res) => {
	const { id } = req.params;
	await categoryService.deleteCategory(id);
	res.status(httpStatus.NO_CONTENT).send();
});

export const statistics = async (req, res) => {
	try {
		const statistics = await Category.aggregate([
			{
				$lookup: {
					from: "episodes",
					localField: "_id",
					foreignField: "category",
					as: "episodes",
				},
			},
			{
				$lookup: {
					from: "articles",
					localField: "_id",
					foreignField: "category",
					as: "articles",
				},
			},
			{
				$project: {
					title: 1,
					episodeCount: { $size: "$episodes" },
					articleCount: { $size: "$articles" },
					totalPlayCount: { $sum: "$episodes.playCount" },
					totalReadCount: { $sum: "$articles.readCount" },
					totalComments: {
						$sum: {
							$add: [
								{
									$size: {
										$ifNull: [
											"$episodes.comments",
											[],
										],
									},
								},
								{
									$size: {
										$ifNull: [
											"$articles.comments",
											[],
										],
									},
								},
							],
						},
					},
				},
			},
		]);

		if (statistics.length === 0) {
			return res.status(404).json({ message: "No statistics found" });
		}

		res.status(200).json(statistics);
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "Server error" });
	}
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

export const getById = catchAsync(async (req, res, next) => {
	const categoryId = req.params.id;

	// Get category using category service
	const category = await categoryService.getCategoryById(categoryId);

	if (!category) {
		throw new ApiError(httpStatus.NOT_FOUND, "Category not found");
	}

	const filter = constructFilters(
		pick(req.query, [
			"isPublishedArticle",
			"searchArticle",
			"readTimeArticle",
			"startDateArticle",
			"endDateArticle",
		])
	);
	filter["category"] = categoryId;
	const options = pick(req.query, ["limitArticle", "pageArticle"]);
	options["populate"] = "category.title"; // Specify the fields you want to populate
	console.log(options);
	const articles = await articleService.getAllArticles(filter, options);

	res.send({ category, articles });
});

// Delete category by ID
export const deleteCategoryById = catchAsync(async (req, res, next) => {
	const { id } = req.params;
	await categoryService.deleteCategoryById(id);
	res.status(httpStatus.NO_CONTENT).send();
});

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
