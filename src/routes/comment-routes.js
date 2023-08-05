import express from "express";
import { isLoggedIn } from "../auth.js";
import {
	updateComment,
	getAllComments,
} from "../controllers/comment-controller.js";
const commentRouter = express.Router();

commentRouter.put("/:id", isLoggedIn, updateComment);
commentRouter.get("/", getAllComments);
export default commentRouter;
