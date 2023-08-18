import exress from "express";
import {
	getAllUsers,
	getUserById,
	toggleStatus,
	getUserProfile,
	updateUser,
	deleteUser,
	statistics,
	updateUserbyAdmin,
	changePassword,
} from "../controllers/user-controller.js";
import { isAdmin, notAdmin, isLoggedIn } from "../auth.js";
const userRouter = exress.Router();

userRouter.get("/statistics", statistics);
userRouter.get("/", getAllUsers);
userRouter.get("/profile", isLoggedIn, getUserProfile);
userRouter.get("/:id", getUserById);
userRouter.patch("/change-password", isLoggedIn, changePassword);
userRouter.patch("/", isLoggedIn, updateUser);
userRouter.patch("/:id", isAdmin, updateUserbyAdmin);
userRouter.put("/:id", toggleStatus);
userRouter.delete("/:id", deleteUser);
export default userRouter;
