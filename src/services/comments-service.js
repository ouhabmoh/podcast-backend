import Article from "../model/Article.js";
import Comment from "../model/Comment.js";

import User from "../model/User.js";
import mongoose from "mongoose";

export const addCommentToArticle = async (articleId, userId, content) => {
	try {
		const existingArticle = await Article.findById(articleId);

		if (!existingArticle) {
			throw new Error("Article not found");
		}

		const comment = new Comment({
			content,
			user: userId,
		});

		let commentId;

		const savedComment = await comment.save();
		commentId = savedComment._id;

		existingArticle.comments.push(commentId);

		await existingArticle.save();

		return { article: existingArticle, commentId };
	} catch (error) {
		throw new Error("Server error");
	}
};

export const deleteCommentFromArticle = async (
	articleId,
	commentId,
	userId
) => {
	try {
		const article = await Article.findById(articleId);

		if (!article) {
			throw new Error("Article not found");
		}

		const comment = await Comment.findById(commentId);

		if (!comment) {
			throw new Error("Comment not found");
		}

		const user = await User.findById(userId);

		if (!user) {
			throw new Error("User not found");
		}

		const userIdObj = new mongoose.Types.ObjectId(userId);

		if (!comment.user.equals(userIdObj) && user.role !== "admin") {
			throw new Error("Unauthorized");
		}

		article.comments.pull(comment._id);
		await article.save();

		return "Successfully deleted";
	} catch (error) {
		throw new Error("Server error");
	}
};
