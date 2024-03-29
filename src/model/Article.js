import mongoose from "mongoose";

const Schema = mongoose.Schema;

const articleSchema = new Schema(
	{
		articleNumber: {
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
		content: {
			type: String,
			required: true,
		},
		image: {
			name: {
				type: String,
				required: true,
			},

			url: {
				type: String,
				required: true,
			},
			size: {
				type: Number,
				required: true,
			},
		},
		readTime: {
			type: Number,
			required: true,
		},
		isPublished: {
			type: Boolean,
			default: true,
			required: true,
		},
		category: {
			type: mongoose.Types.ObjectId,
			ref: "Category",
			required: true,
		},

		readCount: {
			type: Number,
			default: 0,
		},
		comments: [
			{
				type: mongoose.Types.ObjectId,
				ref: "Comment",
			},
		],
		writerName: {
			type: String,
			required: true,
		},
		writerImage: {
			name: {
				type: String,
				required: true,
			},

			url: {
				type: String,
				required: true,
			},
			size: {
				type: Number,
				required: true,
			},
		},
	},
	{ timestamps: true }
);

export default mongoose.model("Article", articleSchema);
