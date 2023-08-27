import mongoose from "mongoose";

const playHistorySchema = new mongoose.Schema(
	{
		date: {
			type: Date,
			required: true,
		},
		playCount: {
			type: Number,
			required: true,
		},
	},
	{ timestamps: true }
);

const PlayHistory = mongoose.model("PlayHistory", playHistorySchema);

export default PlayHistory;
