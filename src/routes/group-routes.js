import express from "express";

import {
	getGroups,
	getById,
	addGroup,
	updateGroup,
	deleteGroup,
	addCategory,
	deleteCategory,
} from "../controllers/group-controller.js";

const groupRouter = express.Router();

groupRouter.get("/", getGroups);
groupRouter.get("/:id", getById);
groupRouter.post("/", addGroup);
groupRouter.patch("/:id", updateGroup);
groupRouter.delete("/:id", deleteGroup);
groupRouter.put("/add/:id", addCategory);
groupRouter.put("/del/:id", deleteCategory);

export default groupRouter;
