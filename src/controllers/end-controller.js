import Endorsement from "../model/Endorsements.js";

// Create an endorsement
export const addEndorsement = async (req, res) => {
	try {
		const endorsement = new Endorsement(req.body);
		await endorsement.save();
		res.status(201).json({
			message: "Endorsement created successfully",
			endorsement,
		});
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "Server error" });
	}
};

// Get all endorsements
export const getAll = async (req, res) => {
	try {
		const endorsements = await Endorsement.find();
		res.status(200).json({ endorsements });
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "Server error" });
	}
};

// Get endorsement by ID
export const getById = async (req, res) => {
	const endorsementId = req.params.id;

	try {
		const endorsement = await Endorsement.findById(endorsementId);
		if (!endorsement) {
			return res
				.status(404)
				.json({ message: "Endorsement not found" });
		}
		res.status(200).json({ endorsement });
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "Server error" });
	}
};

// Update endorsement by ID
export const update = async (req, res) => {
	const _id = req.params.id;
	const update = {};
	for (const key of Object.keys(req.body)) {
		if (req.body[key] !== "") {
			update[key] = req.body[key];
		}
	}

	Endorsement.findOneAndUpdate({ _id }, { $set: update }, { new: true })
		.then((end) => {
			console.log("success");
			res.status(201).json({ message: "updated with success" });
		})
		.catch((err) => {
			console.log("err", err);
			res.status(500).send(err);
		});
};

// Delete endorsement by ID
export const deleteEnd = async (req, res) => {
	const endorsementId = req.params.id;

	try {
		const endorsement = await Endorsement.findByIdAndDelete(
			endorsementId
		);
		if (!endorsement) {
			return res
				.status(404)
				.json({ message: "Endorsement not found" });
		}
		res.status(200).json({ message: "Endorsement deleted successfully" });
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "Server error" });
	}
};
