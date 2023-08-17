import Info from "../model/Info.js";
import handleUpload from "../helper.js";
export const getInfo = async (req, res) => {
	try {
		let info = await Info.findOne();

		// If no info is found, create and return a new Info document with default values
		if (!info) {
			return res.status(404).json({ error: "Info not found" });
		}

		res.status(200).json({ info });
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "Server error" });
	}
};

export const updateInfo = async (req, res) => {
	const update = {};
	for (const key of Object.keys(req.body)) {
		if (req.body[key] !== "") {
			update[key] = req.body[key];
		}
	}

	Info.findOneAndUpdate({}, { $set: update }, { new: true })
		.then((info) => {
			console.log("success");
			res.status(201).json({ message: "updated with success" });
		})
		.catch((err) => {
			console.log("err", err);
			res.status(500).send(err);
		});
};
