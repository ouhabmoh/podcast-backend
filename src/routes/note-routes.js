import  express  from "express";


import { getNotes, updateNote} from "../controllers/note-controller.js";
const noteRouter = express.Router();

noteRouter.get("/", getNotes);
noteRouter.patch("/:noteId", updateNote);
export default noteRouter;


