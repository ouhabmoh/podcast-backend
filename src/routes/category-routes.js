import  express  from "express";


import { getAllCategories, addCategory, updateCategory, getById, deleteCategoryById, getCategoryEpisodes} from "../controllers/category-controller.js";
const categoryRouter = express.Router();

categoryRouter.get("/", getAllCategories);
categoryRouter.post("/", addCategory);
categoryRouter.patch("/:id", updateCategory);
categoryRouter.get("/:id", getById);
categoryRouter.delete("/:id", deleteCategoryById);
categoryRouter.get("/:id", getCategoryEpisodes);

export default categoryRouter;


