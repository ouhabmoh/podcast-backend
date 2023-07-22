import express from "express";
import mongoose from 'mongoose';
import dotenv from 'dotenv';


import userRouter from "./routes/user-routes.js";
import episodeRouter from "./routes/episode-routes.js";
const app = express();


dotenv.config();
mongoose.connect(process.env.MONGO_URL)
        .then(() => console.log("db"))
        .catch((e) => console.log(e));


        app.get("/test", () => {
            console.log("test is succ")
        })


app.use(express.json())
app.use('/resources',express.static('resources'))
app.use("/users",userRouter);
app.use("/episodes", episodeRouter);
app.listen(process.env.PORT || 5000, () =>{
    console.log("backend is running");
});

// Export the app and the serverless function
export default app;
