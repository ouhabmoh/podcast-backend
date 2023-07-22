import  express  from "express";


import {updateInfo, getById} from "../controllers/info-controller.js";
const infoRouter = express.Router();



infoRouter.patch("/:id", updateInfo);
infoRouter.get("/:id", getById);


export default infoRouter;


