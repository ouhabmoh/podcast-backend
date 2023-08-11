import mongoose from "mongoose";

const Schema = mongoose.Schema;

const categorySchema = new Schema(
	{
		title: {
			type: String,
			required: true,
		},
		description: {
			type: String,
			required: true,
		},
		image: {
			url: {
				type: String,
				required: true,
			},
			size: {
				type: Number,
				required: true,
			},
		},
		isPublished: {
			type: Boolean,
			default: true,
			required: true,
		},
	},
	{ timestamps: true }
);

categorySchema.pre("save", async function (next) {
	if (this.isModified("isPublished")) {
		const isPublished = this.isPublished;

		try {
			const Category = mongoose.model("Category");
			const Episode = mongoose.model("Episode");
			const Article = mongoose.model("Article");

			// Update related episodes
			await Episode.updateMany(
				{ category: this._id },
				{ $set: { isPublished } }
			);

			// Update related articles
			await Article.updateMany(
				{ category: this._id },
				{ $set: { isPublished } }
			);

			next();
		} catch (error) {
			next(error);
		}
	} else {
		next();
	}
});

categorySchema.pre("remove", async function (next) {
	try {
		const Episode = mongoose.model("Episode");
		const Article = mongoose.model("Article");
		// Delete related episodes
		await Episode.deleteMany({ category: this._id });

		// Delete related articles
		await Article.deleteMany({ category: this._id });

		next();
	} catch (error) {
		next(error);
	}
});

export default mongoose.model("Category", categorySchema);
