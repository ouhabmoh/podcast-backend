import express from "express";

import {
	getNotes,
	updateNote,
	statistics,
} from "../controllers/note-controller.js";
const noteRouter = express.Router();

noteRouter.get("/statistics", statistics);
noteRouter.get("/", getNotes);
noteRouter.patch("/:noteId", updateNote);
export default noteRouter;
