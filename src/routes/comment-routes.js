import express from "express";
import { isLoggedIn } from "../auth/auth.js";
import { commentValidationRules, validate } from "../validators/validator.js";
import {
	updateComment,
	getAllComments,
	deleteComment,
	addComment,
	statistics,
} from "../controllers/comment-controller.js";
const commentRouter = express.Router();

commentRouter.get("/statistics", statistics);
commentRouter.put("/:id", isLoggedIn, updateComment);
commentRouter.get("/", getAllComments);
commentRouter.post(
	"/comment/:id",
	isLoggedIn,
	commentValidationRules(),
	validate,
	addComment
);
commentRouter.delete("/:id/comment/:commentId", isLoggedIn, deleteComment);

export default commentRouter;
