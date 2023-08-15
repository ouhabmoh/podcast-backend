import PodcastPlatform from "../model/Platform.js";

// Create a podcast platform
export const createPodcastPlatform = async (req, res) => {
	try {
		const podcastPlatform = new PodcastPlatform(req.body);
		await podcastPlatform.save();
		res.status(201).json({
			message: "Podcast platform created successfully",
			podcastPlatform,
		});
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "Server error" });
	}
};

// Get all podcast platforms
export const getAllPodcastPlatforms = async (req, res) => {
	try {
		const podcastPlatforms = await PodcastPlatform.find();
		res.status(200).json({ podcastPlatforms });
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "Server error" });
	}
};

// Get podcast platform by ID
export const getPodcastPlatformById = async (req, res) => {
	const podcastPlatformId = req.params.id;

	try {
		const podcastPlatform = await PodcastPlatform.findById(
			podcastPlatformId
		);
		if (!podcastPlatform) {
			return res
				.status(404)
				.json({ message: "Podcast platform not found" });
		}
		res.status(200).json({ podcastPlatform });
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "Server error" });
	}
};

// Update podcast platform by ID
export const updatePodcastPlatform = async (req, res) => {
	const _id = req.params.id;

	const update = {};
	for (const key of Object.keys(req.body)) {
		if (req.body[key] !== "") {
			update[key] = req.body[key];
		}
	}

	PodcastPlatform.findOneAndUpdate({ _id }, { $set: update }, { new: true })
		.then((plat) => {
			console.log("success");
			res.status(201).json({ message: "updated with success" });
		})
		.catch((err) => {
			console.log("err", err);
			res.status(500).send(err);
		});
};

// Delete podcast platform by ID
export const deletePodcastPlatform = async (req, res) => {
	const podcastPlatformId = req.params.id;

	try {
		const deletedPodcastPlatform =
			await PodcastPlatform.findByIdAndDelete(podcastPlatformId);
		if (!deletedPodcastPlatform) {
			return res
				.status(404)
				.json({ message: "Podcast platform not found" });
		}
		res.status(200).json({
			message: "Podcast platform deleted successfully",
			deletedPodcastPlatform,
		});
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "Server error" });
	}
};
