import  express  from "express";
import multer from 'multer';
import { extname } from 'path';
// Set up Multer storage configuration
// const storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//       // Determine the destination directory based on the file type
//       if (file.fieldname === 'audio') {
//         cb(null, './resources/audios');
//       } else if (file.fieldname === 'image') {
//         cb(null, './resources/images');
//       } else {
//         cb(new Error('Invalid field name'), null);
//       }
//     },
//     filename: (req, file, cb) => {
//       const timestamp = Date.now();
//       const fileExtension = extname(file.originalname);
//       const newFilename = `file_${timestamp}${fileExtension}`;
      
//       cb(null, newFilename);
//     },
//   });
  
// Create Multer instance for handling file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage });

import { getAllEpisodes, addEpisode, updateEpisode, getNotes, getById, deleteEpisodeById, getCategoryEpisodes, getAudioById, addNote, updateNote, deleteNote } from "../controllers/episode-controller.js";
const episodeRouter = express.Router();

episodeRouter.get("/", getAllEpisodes);
episodeRouter.post("/", upload.fields([{ name: 'audio' }, { name: 'image' }]), addEpisode);
episodeRouter.patch("/:id",  upload.fields([{ name: 'audio' }, { name: 'image' }]),  updateEpisode);
episodeRouter.get("/:id", getById);
episodeRouter.get("/:id/audio", getAudioById);
episodeRouter.delete("/:id", deleteEpisodeById);
episodeRouter.get("/category/:id", getCategoryEpisodes);
episodeRouter.get("/notes", getNotes);
episodeRouter.post("/:id/note", addNote);
episodeRouter.patch("/note/:noteId", updateNote);
episodeRouter.delete("/:id/note/:noteId", deleteNote);
export default episodeRouter;


