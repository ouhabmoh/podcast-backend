import authRouter from "./auth-routes.js";
import userRouter from "./user-routes.js";
import episodeRouter from "./episode-routes.js";
import articleRouter from "./article-routes.js";
import categoryRouter from "./category-routes.js";
import infoRouter from "./info-routes.js";
import noteRouter from "./note-routes.js";
import commentRouter from "./comment-routes.js";
import groupRouter from "./group-routes.js";
import endRouter from "./endorsements-routes.js";
import platformRouter from "./platform-routes.js";

import express from "express";

const router = express.Router();

router.use("/auth", authRouter);
router.use("/resources", express.static("resources"));
router.use("/users", userRouter);
router.use("/notes", noteRouter);
router.use("/comments", commentRouter);
router.use("/episodes", episodeRouter);
router.use("/articles", articleRouter);
router.use("/categories", categoryRouter);
router.use("/infos", infoRouter);
router.use("/groups", groupRouter);
router.use("/endoresements", endRouter);
router.use("/platforms", platformRouter);

export default router;
