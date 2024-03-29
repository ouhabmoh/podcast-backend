import Category from "../model/Category.js";
import Episode from "../model/Episode.js";
import User from "../model/User.js";
import Note from "../model/Note.js";
import { getAudioDurationInSeconds } from "get-audio-duration";
import mongoose from "mongoose";

export const statistics = async (req, res) => {
	try {
		const statistics = await Note.aggregate([
			{
				$group: {
					_id: null,
					totalNotes: { $sum: 1 },
				},
			},
			{
				$project: {
					_id: 0,
					totalNotes: 1,
				},
			},
		]);

		const totalNotes =
			statistics.length > 0 ? statistics[0].totalNotes : 0;

		res.status(200).json({ totalNotes });
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "Server error" });
	}
};

export const getNotes = async (req, res) => {
	let episodes;
	let page = parseInt(req.query.page);
	let limit = parseInt(req.query.limit);
	if (!page || page < 1) {
		page = 1;
	}
	if (!limit || limit < 1) {
		limit = 6;
	}
	let count;
	try {
		episodes = await Episode.find({
			isPublished: true,
			notes: { $exists: true, $not: { $size: 0 } },
		})
			.select(
				"id episodeNumber title smallDescription notesDescription category image duration createdAt notes"
			)
			// We multiply the "limit" variables by one just to make sure we pass a number and not a string
			.limit(limit * 1)
			// I don't think i need to explain the math here
			.skip((page - 1) * limit)
			// We sort the data by the date of their creation in descending order (user 1 instead of -1 to get ascending order)
			.sort({ createdAt: -1 })
			.populate("category", "id title")
			.populate("notes", "note time")
			.exec();
		// Getting the numbers of products stored in database
		count = await Episode.countDocuments();
	} catch (error) {
		res.status(404).json({ message: "Error when getting episodes" });
	}
	if (!episodes) {
		res.status(404).json({ message: "No Episodes Found" });
	}
	const formattedEpisodes = episodes.map((episode) => {
		const createdAt = episode.createdAt.toISOString().split("T")[0];
		return { ...episode._doc, createdAt };
	});

	return res.status(200).json({
		totalPages: Math.ceil(count / limit),
		episodes: formattedEpisodes,
	});
};

// Route to handle the PATCH request for updating episode fields
export const updateNote = async (req, res) => {
	const noteId = req.params.noteId;
	const updates = req.body;
	console.log(updates);
	try {
		// Verify and validate the updates
		const allowedUpdates = ["note", "time"];
		const isValidOperation = Object.keys(updates).every((update) =>
			allowedUpdates.includes(update)
		);

		if (!isValidOperation) {
			return res.status(400).json({ error: "Invalid updates" });
		}

		// Find the episode by ID
		const note = await Note.findById(noteId);
		if (!note) {
			return res.status(404).json({ error: "Note not found" });
		}

		// Apply updates to the episode
		Object.assign(note, updates);

		// Save the updated episode
		const updatedNote = await note.save();

		res.json(updatedNote);
	} catch (error) {
		res.status(500).json({ error: "Server error" });
	}
};
