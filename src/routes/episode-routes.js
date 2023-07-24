import  express  from "express";
import { episodeValidationRules, validate } from "../validator.js";
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
import { getAllEpisodes, addEpisode, updateEpisode, getById, deleteEpisodeById, getAudioById, addNote, deleteNote } from "../controllers/episode-controller.js";
const episodeRouter = express.Router();

episodeRouter.get("/", getAllEpisodes);
// episodeRouter.post("/", upload.fields([{ name: 'audio' }, { name: 'image' }]), addEpisode);
// episodeRouter.patch("/:id",  upload.fields([{ name: 'audio' }, { name: 'image' }]),  updateEpisode);
episodeRouter.post("/", episodeValidationRules(), validate, addEpisode);
episodeRouter.patch("/:id", updateEpisode);
episodeRouter.get("/:id", getById);
episodeRouter.get("/:id/audio", getAudioById);
episodeRouter.delete("/:id", deleteEpisodeById);
episodeRouter.post("/:id/note", addNote);

episodeRouter.delete("/:id/note/:noteId", deleteNote);
export default episodeRouter;


