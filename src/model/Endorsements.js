import mongoose from "mongoose";

const endorsementSchema = new mongoose.Schema({
	name: {
		type: String,
		required: true,
	},
	jobTitle: {
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
	review: {
		type: String,
		required: true,
	},
});

export default mongoose.model("Endorsement", endorsementSchema);
