import mongoose from "mongoose";

const podcastPlatformSchema = new mongoose.Schema({
	name: {
		type: String,
		required: true,
	},
	url: {
		type: String,
		required: true,
	},
});

const PodcastPlatform = mongoose.model(
	"PodcastPlatform",
	podcastPlatformSchema
);

export default PodcastPlatform;
