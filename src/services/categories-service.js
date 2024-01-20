// categories.service.js
import Category from "../model/Category.js";
import ApiError from "../utils/ApiError.js";
import httpStatus from "http-status";

export const getAllCategories = async (filters) => {
	const categories = await Category.aggregate([
		{
			$match: filters,
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
			$sort: {
				createdAt: -1, // Sort by createdAt in descendant order (-1)
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
	return categories;
};

export const createCategory = async (categoryBody) => {
	return Category.create(categoryBody);
};

export const updateCategory = async (_id, updates) => {
	const category = await Category.findOneAndUpdate(
		{ _id },
		{ $set: updates },
		{ new: true }
	);
	return category;
};

export const deleteCategoryById = async (categoryId) => {
	await Category.findByIdAndDelete(categoryId);
	return;
};

// Add any additional category-related functionalities
