const mongoose = require("mongoose");

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

const Endorsement = mongoose.model("Endorsement", endorsementSchema);

module.exports = Endorsement;
