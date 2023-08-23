import express from "express";
import {
	episodeValidationRules,
	commentValidationRules,
	validate,
} from "../validators/validator.js";
import { isAdmin, notAdmin, isLoggedIn } from "../auth/auth.js";

import {
	getAllEpisodes,
	addEpisode,
	getLastEpisodeNumber,
	toggleIsPublished,
	getEpisodeNeighbours,
	updateEpisode,
	getById,
	deleteEpisodeById,
	getAudioById,
	addNote,
	deleteNote,
	addComment,
	deleteComment,
	incrementPlayCount,
	getSimilairById,
	getMostPlayedEpisodes,
	addToFavoritesEpisode,
	deleteFromFavoritesEpisode,
	checkUserFavorites,
	episodesStatistics,
} from "../controllers/episode-controller.js";
const episodeRouter = express.Router();

episodeRouter.get("/statistics", episodesStatistics);
episodeRouter.get("/:episodeId/check-favorite", isLoggedIn, checkUserFavorites);
episodeRouter.get("/", getAllEpisodes);
episodeRouter.get("/trending", getMostPlayedEpisodes);
episodeRouter.get("/last", getLastEpisodeNumber);
episodeRouter.get("/neighbors/:episodeNumber", getEpisodeNeighbours);
// episodeRouter.post("/", upload.fields([{ name: 'audio' }, { name: 'image' }]), addEpisode);
// episodeRouter.patch("/:id",  upload.fields([{ name: 'audio' }, { name: 'image' }]),  updateEpisode);
episodeRouter.put("/:id", incrementPlayCount);
episodeRouter.put("/favorites/:episodeId", isLoggedIn, addToFavoritesEpisode);
episodeRouter.delete(
	"/favorites/:episodeId",
	isLoggedIn,
	deleteFromFavoritesEpisode
);
episodeRouter.post(
	"/comment/:id",
	isLoggedIn,
	commentValidationRules(),
	validate,
	addComment
);
episodeRouter.post("/", episodeValidationRules(), validate, addEpisode);
episodeRouter.put("/isPublished/:id", toggleIsPublished);
episodeRouter.patch("/:id", updateEpisode);
episodeRouter.get("/:id", getById);
episodeRouter.get("/:id/audio", getAudioById);
episodeRouter.delete("/:id", deleteEpisodeById);
episodeRouter.post("/:id/note", addNote);
episodeRouter.get("/similair/:id", getSimilairById);
episodeRouter.delete("/:id/note/:noteId", deleteNote);
episodeRouter.delete("/:id/comment/:commentId", isLoggedIn, deleteComment);
export default episodeRouter;
