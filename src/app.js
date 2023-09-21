import express from "express";

import cors from "cors";
import connectDB from "./config/db.js"; // Import the database connection function
import router from "./routes/router.js";

const app = express();

connectDB(); // Call the database connection function

// enabling CORS for any unknown origin(https://xyz.example.com)
app.use(cors());
app.use(express.json({ limit: "500mb" }));

app.use(router);

app.listen(process.env.PORT || 5000, () => {
	console.log("backend is running");
});

// Export the app and the serverless function
export default app;
