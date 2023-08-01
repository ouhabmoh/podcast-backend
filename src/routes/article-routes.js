import  express  from "express";
// import { articleValidationRules, validate } from "../validator.js";
import {isAdmin, notAdmin} from "../auth.js";


import { getAllArticles, addArticle, toggleIsPublished, updateArticle, getById, deleteArticleById} from "../controllers/article-controller.js";
const articleRouter = express.Router();


articleRouter.get("/", getAllArticles);

articleRouter.post("/", addArticle);
articleRouter.put("/isPublished/:id", toggleIsPublished);
articleRouter.patch("/:id", updateArticle);
articleRouter.get("/:id", getById);

articleRouter.delete("/:id",  deleteArticleById);

export default articleRouter;


