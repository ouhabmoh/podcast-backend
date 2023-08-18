import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";

import authRouter from "./routes/auth-routes.js";
import userRouter from "./routes/user-routes.js";
import episodeRouter from "./routes/episode-routes.js";
import articleRouter from "./routes/article-routes.js";
import categoryRouter from "./routes/category-routes.js";
import infoRouter from "./routes/info-routes.js";
import noteRouter from "./routes/note-routes.js";
import commentRouter from "./routes/comment-routes.js";
import groupRouter from "./routes/group-routes.js";
import endRouter from "./routes/endorsements-routes.js";
import platformRouter from "./routes/platform-routes.js";

import Article from "./model/Article.js";
import Episode from "./model/Episode.js";
import Group from "./model/Group.js";
import Comment from "./model/Comment.js";

const app = express();
app.timeout = 300000;

dotenv.config();
mongoose
	.connect(
		"mongodb://ismmoh:wPLMCu9SObXxfK8a@ac-bp6oqvh-shard-00-00.3x6gazm.mongodb.net:27017,ac-bp6oqvh-shard-00-01.3x6gazm.mongodb.net:27017,ac-bp6oqvh-shard-00-02.3x6gazm.mongodb.net:27017/?ssl=true&replicaSet=atlas-w68tpt-shard-0&authSource=admin&retryWrites=true&w=majority"
	)
	.then(() => console.log("db"))
	.catch((e) => console.log(e));

app.get("/test", () => {
	console.log("test is succ");
});

// import crypto from 'crypto';

// const secretKey = crypto.randomBytes(32).toString('hex');
// console.log(secretKey);
// enabling CORS for any unknown origin(https://xyz.example.com)
app.use(cors());
app.use(express.json({ limit: "500mb" }));
// Configure express-session middleware
// app.use(session({
//   secret: 'your-secret-key',
//   resave: false,
//   saveUninitialized: true,
// }));

// (async () => {
// 	try {
// 		const result = await Comment.deleteMany({});
// 		console.log(`${result.deletedCount} documents deleted.`);
// 	} catch (error) {
// 		console.error("Error deleting documents:", error);
// 	} finally {
// 	}
// })();

app.use("/auth", authRouter);
app.use("/resources", express.static("resources"));
app.use("/users", userRouter);
app.use("/notes", noteRouter);
app.use("/comments", commentRouter);
app.use("/episodes", episodeRouter);
app.use("/articles", articleRouter);
app.use("/categories", categoryRouter);
app.use("/infos", infoRouter);
app.use("/groups", groupRouter);
app.use("/endoresements", endRouter);
app.use("/platforms", platformRouter);
app.listen(process.env.PORT || 5000, () => {
	console.log("backend is running");
});

// Export the app and the serverless function
export default app;
