import express from "express";

import cors from "cors";
import connectDB from "./config/db.js"; // Import the database connection function

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

const app = express();

connectDB(); // Call the database connection function

// enabling CORS for any unknown origin(https://xyz.example.com)
app.use(cors());
app.use(express.json({ limit: "500mb" }));

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
