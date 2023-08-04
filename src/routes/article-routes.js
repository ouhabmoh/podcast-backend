import  express  from "express";
// import { articleValidationRules, validate } from "../validator.js";
import {isAdmin, notAdmin, isLoggedIn} from "../auth.js";


import { getAllArticles, getLastArticleNumber, addArticle, toggleIsPublished, updateArticle, getById, deleteArticleById, addComment, deleteComment} from "../controllers/article-controller.js";
const articleRouter = express.Router();


articleRouter.get("/", getAllArticles);
articleRouter.get("/", getLastArticleNumber);
articleRouter.post("/:id", isLoggedIn, addComment);
articleRouter.post("/", addArticle);
articleRouter.put("/isPublished/:id", toggleIsPublished);
articleRouter.patch("/:id", updateArticle);
articleRouter.get("/:id", getById);

articleRouter.delete("/:id",  deleteArticleById);
articleRouter.delete("/:id/comment/:commentId", isLoggedIn, deleteComment);
export default articleRouter;


