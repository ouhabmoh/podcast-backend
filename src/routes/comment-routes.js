import  express  from "express";
import { isLoggedIn } from "../auth.js";
import { updateComment} from "../controllers/comment-controller.js";
const commentRouter = express.Router();

commentRouter.put("/:id", isLoggedIn, updateComment);

export default commentRouter;


