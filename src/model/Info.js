import mongoose from "mongoose";

const Schema = mongoose.Schema;

const infoSchema = new Schema({
	description1: {
		type: String,
		required: true,
	},
	description2: {
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
	name: {
		type: String,
		required: true,
	},
	address: {
		type: String,
		required: true,
	},
	title: {
		type: String,
		required: true,
	},
	description3: {
		type: String,
		required: true,
	},
	description4: {
		type: String,
		required: true,
	},

	image2: {
		url: {
			type: String,
			required: true,
		},
		size: {
			type: Number,
			required: true,
		},
	},
});

export default mongoose.model("Info", infoSchema);
