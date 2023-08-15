import express from "express";
import {
	createPodcastPlatform,
	getAllPodcastPlatforms,
	getPodcastPlatformById,
	updatePodcastPlatform,
	deletePodcastPlatform,
} from "../controllers/platform-controller.js";

const router = express.Router();

router.post("/", createPodcastPlatform);
router.get("/", getAllPodcastPlatforms);
router.get("/:id", getPodcastPlatformById);
router.patch("/:id", updatePodcastPlatform);
router.delete("/:id", deletePodcastPlatform);

export default router;
