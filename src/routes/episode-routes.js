import  express  from "express";
import multer from 'multer';

// Set up Multer storage configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      // Determine the destination directory based on the file type
      if (file.fieldname === 'audio') {
        cb(null, './resources/audios');
      } else if (file.fieldname === 'image') {
        cb(null, './resources/images');
      } else {
        cb(new Error('Invalid field name'), null);
      }
    },
    filename: (req, file, cb) => {
      cb(null, file.originalname);
    },
  });
  
// Create Multer instance for handling file uploads
const upload = multer({ storage });

import { getAllEpisodes, addEpisode, updateEpisode, getById, deleteEpisodeById, getCategoryEpisodes } from "../controllers/episode-controller.js";
const episodeRouter = express.Router();

episodeRouter.get("/", getAllEpisodes);
episodeRouter.post("/add", upload.fields([{ name: 'audio' }, { name: 'image' }]), addEpisode);
episodeRouter.put("/update/:id", updateEpisode);
episodeRouter.get("/:id", getById);
episodeRouter.delete("/:id", deleteEpisodeById);
episodeRouter.get("/category/:id", getCategoryEpisodes);

export default episodeRouter;


