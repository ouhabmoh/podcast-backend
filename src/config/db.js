import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

// Define your MongoDB connection URL here
const dbURL = process.env.MONGO_URL;

const connectDB = async () => {
	try {
		await mongoose.connect(dbURL, {
			useNewUrlParser: true,
			useUnifiedTopology: true,
		});
		console.log("Connected to the database");
	} catch (error) {
		console.error("Error connecting to the database:", error);
		process.exit(1);
	}
};

export default connectDB;
