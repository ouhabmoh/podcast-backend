import express from "express";

import {
	getAllCategories,
	addCategory,
	updateCategory,
	getById,
	deleteCategoryById,
	getCategoryEpisodes,
	toggleIsPublished,
	statistics,
} from "../controllers/category-controller.js";
const categoryRouter = express.Router();

categoryRouter.get("/statistics", statistics);
categoryRouter.get("/", getAllCategories);
categoryRouter.post("/", addCategory);
categoryRouter.patch("/:id", updateCategory);
categoryRouter.put("/isPublished/:id", toggleIsPublished);
categoryRouter.get("/:id", getById);
categoryRouter.delete("/:id", deleteCategoryById);
categoryRouter.get("/episodes/:id", getCategoryEpisodes);

export default categoryRouter;
