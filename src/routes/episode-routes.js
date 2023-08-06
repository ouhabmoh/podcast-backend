import express from "express";
import { episodeValidationRules, validate } from "../validator.js";
import { isAdmin, notAdmin, isLoggedIn } from "../auth.js";
// import multer from 'multer';
// import { extname } from 'path';
// // Set up Multer storage configuration
// // const storage = multer.diskStorage({
// //     destination: (req, file, cb) => {
// //       // Determine the destination directory based on the file type
// //       if (file.fieldname === 'audio') {
// //         cb(null, './resources/audios');
// //       } else if (file.fieldname === 'image') {
// //         cb(null, './resources/images');
// //       } else {
// //         cb(new Error('Invalid field name'), null);
// //       }
// //     },
// //     filename: (req, file, cb) => {
// //       const timestamp = Date.now();
// //       const fileExtension = extname(file.originalname);
// //       const newFilename = `file_${timestamp}${fileExtension}`;

// //       cb(null, newFilename);
// //     },
// //   });

// // Create Multer instance for handling file uploads
// const storage = multer.memoryStorage();
// const upload = multer({ storage ,
//   fileFilter: function(_req, file, cb){
//       checkFileType(file, cb);
//   }});
// function checkFileType(file, cb){
//   // Allowed ext
//   const filetypes = /jpeg|jpg|png|gif|mp3|webp/;
//   // Check ext
//   console.log(extname(file.originalname).toLowerCase());
//   const exname = filetypes.test(extname(file.originalname).toLowerCase());
//   // Check mime
//   // console.log(file.mimetype);
//   // const mimetype = filetypes.test(file.mimetype);

//   if(exname){
//     return cb(null, true);
//   } else {
//     return cb(null, false);
//   }
// }

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
} from "../controllers/episode-controller.js";
const episodeRouter = express.Router();

// episodeRouter.get("/", notAdmin, getAllEpisodes);
// episodeRouter.get("/last", getLastEpisodeNumber);
// episodeRouter.get("/neighbors/:episodeNumber", getEpisodeNeighbours);
// // episodeRouter.post("/", upload.fields([{ name: 'audio' }, { name: 'image' }]), addEpisode);
// // episodeRouter.patch("/:id",  upload.fields([{ name: 'audio' }, { name: 'image' }]),  updateEpisode);
// episodeRouter.post("/", isAdmin, episodeValidationRules(), validate, addEpisode);
// episodeRouter.put("/isPublished/:id", isAdmin, toggleIsPublished);
// episodeRouter.patch("/:id", isAdmin, updateEpisode);
// episodeRouter.get("/:id", getById);
// episodeRouter.get("/:id/audio", getAudioById);
// episodeRouter.delete("/:id", isAdmin, deleteEpisodeById);
// episodeRouter.post("/:id/note", isAdmin, addNote);

// episodeRouter.delete("/:id/note/:noteId", isAdmin, deleteNote);

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
episodeRouter.post("/comment/:id", isLoggedIn, addComment);
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
