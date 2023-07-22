import  express  from "express";
import multer from 'multer';

import {updateInfo, getInfo} from "../controllers/info-controller.js";
const infoRouter = express.Router();
// Create Multer instance for handling file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage });


infoRouter.patch("/", upload.fields([{ name: 'image2' }, { name: 'image' }]), updateInfo);
infoRouter.get("/", getInfo);


export default infoRouter;


