import express from "express";
// import { articleValidationRules, validate } from "../validator.js";
import { isAdmin, notAdmin, isLoggedIn } from "../auth.js";
import { commentValidationRules, validate } from "../validator.js";
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
	addToFavoritesArticle,
	deleteFromFavoritesArticle,
	checkUserFavorites,
	articlesStatistics,
} from "../controllers/article-controller.js";
const articleRouter = express.Router();

articleRouter.get("/statistics", articlesStatistics);
articleRouter.get("/:articleId/check-favorite", isLoggedIn, checkUserFavorites);
articleRouter.get("/", getAllArticles);
articleRouter.get("/trending", getMostReadArticles);
articleRouter.get("/last", getLastArticleNumber);
articleRouter.put("/favorites/:articleId", isLoggedIn, addToFavoritesArticle);
articleRouter.delete(
	"/favorites/:articleId",
	isLoggedIn,
	deleteFromFavoritesArticle
);
articleRouter.post(
	"/comment/:id",
	isLoggedIn,
	commentValidationRules(),
	validate,
	addComment
);
articleRouter.post("/", addArticle);
articleRouter.put("/isPublished/:id", toggleIsPublished);
articleRouter.patch("/:id", updateArticle);
articleRouter.get("/:id", getById);
articleRouter.get("/similair/:id", getSimilairById);
articleRouter.delete("/:id", deleteArticleById);
articleRouter.delete("/:id/comment/:commentId", isLoggedIn, deleteComment);
export default articleRouter;
