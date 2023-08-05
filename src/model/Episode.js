import mongoose from "mongoose";

const Schema = mongoose.Schema;

const episodeSchema = new Schema(
	{
		episodeNumber: {
			type: Number,
		},
		title: {
			type: String,
			required: true,
		},
		description: {
			type: String,
			required: true,
		},
		category: {
			type: mongoose.Types.ObjectId,
			ref: "Category",
			required: true,
		},
		image: {
			type: String,
			required: true,
		},
		audio: {
			type: String,
			required: true,
		},
		duration: {
			type: String,
			required: true,
		},
		isPublished: {
			type: Boolean,
			default: true,
			required: true,
		},
		playCount: {
			type: Number,
			default: 0,
		},
		explication: {
			type: String,
		},
		notes: [
			{
				type: Schema.Types.ObjectId,
				ref: "Note",
			},
		],
		comments: [
			{
				type: mongoose.Types.ObjectId,
				ref: "Comment",
			},
		],
	},
	{ timestamps: true }
);

export default mongoose.model("Episode", episodeSchema);
