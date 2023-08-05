import express from "express";
// import { articleValidationRules, validate } from "../validator.js";
import { isAdmin, notAdmin, isLoggedIn } from "../auth.js";

import {
	getAllArticles,
	getSimilairById,
	getLastArticleNumber,
	addArticle,
	toggleIsPublished,
	updateArticle,
	getById,
	deleteArticleById,
	addComment,
	deleteComment,
	getMostReadArticles,
} from "../controllers/article-controller.js";
const articleRouter = express.Router();

articleRouter.get("/", getAllArticles);
articleRouter.get("/trending", getMostReadArticles);
articleRouter.get("/last", getLastArticleNumber);
articleRouter.post("/:id", isLoggedIn, addComment);
articleRouter.post("/", addArticle);
articleRouter.put("/isPublished/:id", toggleIsPublished);
articleRouter.patch("/:id", updateArticle);
articleRouter.get("/:id", getById);
articleRouter.get("/similair/:id", getSimilairById);
articleRouter.delete("/:id", deleteArticleById);
articleRouter.delete("/:id/comment/:commentId", isLoggedIn, deleteComment);
export default articleRouter;
