import mongoose from "mongoose";

const Schema = mongoose.Schema;

const infoSchema = new Schema({
	homepage: {
		header: String,
		title: String,
		description: String,
	},
	overview: {
		title: String,
		description: String,
		podcastDescription: String,
		imgPodcasts: {
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
		notesDescription: String,
		imgNotes: String,
	},
	drive: {
		img: {
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
		text: String,
	},

	drive2: {
		img: {
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
		text: String,
	},

	section: {
		title: String,
		description: String,
	},

	aboutUs: {
		description: String,
		name: String,
		address: String,
	},

	footer: {
		description: String,
	},
});

// Generate default values for nested objects and arrays
infoSchema.set("toObject", { getters: true, virtuals: false });

export default mongoose.model("Info", infoSchema);
