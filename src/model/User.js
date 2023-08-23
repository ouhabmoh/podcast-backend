import mongoose from "mongoose";
import Episode from "./Episode.js";
import Article from "./Article.js";
import passportLocalMongoose from "passport-local-mongoose";

const Schema = mongoose.Schema;

const userSchema = Schema(
	{
		google: {
			id: {
				type: String,
			},
			username: {
				type: String,
			},
			name: {
				type: String,
			},
			email: {
				type: String,
			},
		},
		facebook: {
			id: {
				type: String,
			},
			username: {
				type: String,
			},
			name: {
				type: String,
			},
			email: {
				type: String,
			},
		},
		local: {
			email: {
				type: String,
			},
			name: {
				type: String,
			},
			emailConfirmed: {
				type: Boolean,
				default: false,
			},

			// The password field will be added by passport-local-mongoose
		},
		role: {
			type: String,
			default: "User",
		},
		status: {
			type: String,
			default: "Active",
		},

		favoritesEpisodes: [
			{
				type: mongoose.Types.ObjectId,
				ref: "Episode",
			},
		],

		favoritesArticles: [
			{
				type: mongoose.Types.ObjectId,
				ref: "Article",
			},
		],
	},
	{ timestamps: true }
);

userSchema.plugin(passportLocalMongoose, {
	usernameField: "local.username", // The field name to accept email or username
	hashField: "local.hash", //

	usernameUnique: false,
});

userSchema.pre("remove", async function (next) {
	const userId = this._id;

	// Delete comments associated with the user from episodes
	await Episode.updateMany({}, { $pull: { comments: { user: userId } } });

	// Delete comments associated with the user from articles
	await Article.updateMany({}, { $pull: { comments: { user: userId } } });

	next();
});

export default mongoose.model("User", userSchema);
