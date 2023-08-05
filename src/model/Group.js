import mongoose from "mongoose";

const Schema = mongoose.Schema;

const groupSchema = new Schema(
	{
		title: {
			type: String,
			required: true,
		},
		description: {
			type: String,
			required: true,
		},

		categories: [
			{
				type: mongoose.Types.ObjectId,
				ref: "Category",
			},
		],
	},
	{ timestamps: true }
);

export default mongoose.model("Group", groupSchema);
