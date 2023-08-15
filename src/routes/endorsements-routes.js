import express from "express";
import {
	addEndorsement,
	getAll,
	getById,
	update,
	deleteEnd,
} from "../controllers/end-controller.js";

const endorsementRouter = express.Router();

endorsementRouter.post("/", addEndorsement);
endorsementRouter.get("/", getAll);
endorsementRouter.get("/:id", getById);
endorsementRouter.patch("/:id", update);
endorsementRouter.delete("/:id", deleteEnd);

export default endorsementRouter;
