import exress from "express";
import {
	getAllUsers,
	getUserById,
	toggleStatus,
	getUserProfile,
	updateUser,
	deleteUser,
} from "../controllers/user-controller.js";
import { isAdmin, notAdmin, isLoggedIn } from "../auth.js";
const userRouter = exress.Router();

userRouter.get("/", getAllUsers);
userRouter.get("/profile", isLoggedIn, getUserProfile);
userRouter.get("/:id", getUserById);
userRouter.patch("/", isLoggedIn, updateUser);
userRouter.put("/:id", toggleStatus);
userRouter.delete("/:id", deleteUser);
export default userRouter;
