import exress from "express";
import { getAllUsers, getUserById } from "../controllers/user-controller.js";

const userRouter = exress.Router();

userRouter.get("/", getAllUsers);
userRouter.get("/:id", getUserById);

export default userRouter;
