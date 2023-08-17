import express from "express";

import { updateInfo, getInfo } from "../controllers/info-controller.js";
const infoRouter = express.Router();

infoRouter.patch("/", updateInfo);
infoRouter.get("/", getInfo);

export default infoRouter;
