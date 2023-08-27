import mongoose from "mongoose";

const readHistorySchema = new mongoose.Schema(
	{
		date: {
			type: Date,
			required: true,
		},
		readCount: {
			type: Number,
			default: 0,
			required: true,
		},
	},
	{ timestamps: true }
);

const ReadHistory = mongoose.model("ReadHistory", readHistorySchema);

export default ReadHistory;
