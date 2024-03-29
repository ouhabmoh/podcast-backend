import Category from "../model/Category.js";
import Episode from "../model/Episode.js";
import User from "../model/User.js";
import Note from "../model/Note.js";
import Comment from "../model/Comment.js";
import PlayHistory from "../model/PlayHistory.js";
import mongoose from "mongoose";
import { ObjectId } from "mongodb";

import fs from "fs";

// Controller function to get the 6 most played episodes

export const episodesStatistics = async (req, res) => {
	try {
		const statistics = await Episode.aggregate([
			{
				$group: {
					_id: null,
					totalEpisodes: { $sum: 1 },
					publishedEpisodes: {
						$sum: {
							$cond: [
								{ $eq: ["$isPublished", true] },
								1,
								0,
							],
						},
					},
					notPublishedEpisodes: {
						$sum: {
							$cond: [
								{ $eq: ["$isPublished", false] },
								1,
								0,
							],
						},
					},
					totalPlayCount: { $sum: "$playCount" },
					totalComments: {
						$sum: {
							$size: {
								$ifNull: ["$comments", []],
							},
						},
					},
					totalNotes: {
						$sum: {
							$size: {
								$ifNull: ["$notes", []],
							},
						},
					},
					// Add more statistics fields here
				},
			},

			{
				$project: {
					_id: 0, // Exclude the _id field from the result
					totalEpisodes: 1,
					publishedEpisodes: 1,
					notPublishedEpisodes: 1,
					totalPlayCount: 1,
					totalComments: 1,
					totalNotes: 1,
					// Add more fields to include in the result
				},
			},
		]);

		if (statistics.length === 0) {
			return res.status(404).json({ message: "No statistics found" });
		}

		const episodeStatistics = statistics[0];
		res.status(200).json(episodeStatistics);
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "Server error" });
	}
};

export const checkUserFavorites = async (req, res) => {
	try {
		const episodeId = req.params.episodeId;
		const userId = req.user._id;

		// Check if the user has favorited the episode
		const user = await User.findById(userId).select("favoritesEpisodes");

		// Extract the favoritesEpisodes array from the user object
		const favoritesEpisodes = user ? user.favoritesEpisodes : [];

		const isFavorited = favoritesEpisodes
			? favoritesEpisodes.some((episode) => episode.equals(episodeId))
			: false;

		res.status(200).json({ isFavorited });
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "Server error" });
	}
};

export const addToFavoritesEpisode = async (req, res) => {
	try {
		const userId = req.user._id;
		const episodeId = req.params.episodeId;
		console.log(userId);
		const user = await User.findById(userId);

		// Check if the episode exists in the database
		const episode = await Episode.findById(episodeId);
		if (!episode) {
			return res.status(404).json({ message: "Episode not found" });
		}
		console.log(user);
		// Check if the episode already exists in the favorites list
		if (!user.favoritesEpisodes?.includes(episodeId)) {
			user.favoritesEpisodes.push(episodeId);
			await user.save();
		}

		res.status(200).json({
			message: "Episode added to favorites successfully",
		});
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "Server error" });
	}
};

// Endpoint to delete an episode from favorites
export const deleteFromFavoritesEpisode = async (req, res) => {
	const episodeId = req.params.episodeId;
	const userId = req.user._id;

	try {
		// Check if the episode exists in the favorites of the user
		const user = await User.findById(userId);
		if (!user.favoritesEpisodes.includes(episodeId)) {
			return res
				.status(404)
				.json({ message: "Episode not found in favorites" });
		}

		// Remove the episode from favorites
		user.favoritesEpisodes.pull(episodeId);
		await user.save();

		res.status(200).json({
			message: "Episode removed from favorites successfully",
		});
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "Server error" });
	}
};

export const getMostPlayedEpisodes = async (req, res) => {
	const limit = req.query.limit ? parseInt(req.query.limit) : 6;
	try {
		// Use the find method to get the episodes, sorted by playCount in descending order, and limit to 6 results
		const mostPlayedEpisodes = await Episode.find()
			.select(
				"id episodeNumber title smallDescription notesDescription category image duration createdAt isPublished playCount"
			)
			.populate("category", "id title")
			.sort({ playCount: -1 })
			.limit(limit);

		// Return the most played episodes as a response
		res.status(200).json({ episodes: mostPlayedEpisodes });
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "Server error" });
	}
};

export const getSimilairById = async (req, res) => {
	const episodeId = req.params.id;
	const limit = req.query.limit ? parseInt(req.query.limit) : 6;
	try {
		// Find the episode by ID to get its title and category
		const episode = await Episode.findById(episodeId).select("title");

		if (!episode) {
			return res.status(404).json({ message: "Episode not found" });
		}

		const episodeTitle = episode.title;
		const searchWords = episodeTitle
			.split(" ")
			.filter((word) => word !== "");

		// Create a regex pattern to match any of the search words in the episode title
		const regexPattern = searchWords
			.map((word) => `(?=.*${word})`)
			.join("|");

		const regexQuery = new RegExp(regexPattern, "i");
		// Find similar episodes in the same category based on similar titles
		const similarEpisodes = await Episode.find({
			_id: { $ne: episodeId }, // Exclude the current episode from the results
			title: { $regex: regexQuery }, // Case-insensitive search for similar titles
		})
			.limit(limit)
			.select(
				"id episodeNumber title smallDescription notesDescription category image duration createdAt isPublished playCount"
			)
			.populate("category", "id title")
			.sort({ createdAt: -1 })
			.exec();

		return res.status(200).json({ similarEpisodes });
	} catch (error) {
		console.log(error);
		return res.status(500).json({ message: "Server error" });
	}
};

export const incrementPlayCount = async (req, res) => {
	const _id = req.params.id;
	try {
		const result = await Episode.updateOne(
			{ _id }, // Query: Find the episode by its ID
			{ $inc: { playCount: 1 } } // Update: Increment the playCount field by 1
		);
		if (result.nModified === 0) {
			// If no documents were modified, the episode was not found
			return res.status(404).json({ message: "Episode not found" });
		}

		// Get the current date (year, month, day)
		const currentDate = new Date();
		currentDate.setHours(0, 0, 0, 0); // Set time to midnight

		// Update the play history for the current date
		await PlayHistory.findOneAndUpdate(
			{ date: currentDate },
			{ $inc: { playCount: 1 } },
			{ upsert: true }
		);

		// Send the response indicating successful update
		return res
			.status(200)
			.json({ message: "Play count updated successfully" });
	} catch (error) {
		// Handle error
		console.error(error);
		return res.status(500).json({ message: "Server error" });
	}
};
export const getLastEpisodeNumber = async (req, res) => {
	let episode;
	try {
		episode = await Episode.find()
			.select("id episodeNumber")
			// We multiply the "limit" variables by one just to make sure we pass a number and not a string
			.limit(1)

			// We sort the data by the date of their creation in descending order (user 1 instead of -1 to get ascending order)
			.sort({ episodeNumber: -1 })

			.exec();
	} catch (error) {
		res.status(404).json({ message: "Error when getting episode" });
	}
	if (!episode) {
		res.status(404).json({ message: "No Episode Found" });
	}

	return res.status(200).json(episode);
};

export const getEpisodeNeighbours = async (req, res) => {
	const episodeNumber = parseInt(req.params.episodeNumber);

	let nextEpisode;
	let previousEpisode;

	try {
		if (episodeNumber !== 0) {
			const previousEpisodeNumber = episodeNumber - 1;
			previousEpisode = await Episode.findOne({
				episodeNumber: previousEpisodeNumber,
			})
				.select(
					"id episodeNumber title smallDescription notesDescription category image duration createdAt isPublished playCount"
				)
				.exec();
		} else {
			previousEpisode = null;
		}
		const nextEpisodeNumber = episodeNumber + 1;

		nextEpisode = await Episode.findOne({
			episodeNumber: nextEpisodeNumber,
		})
			.select(
				"id episodeNumber title smallDescription notesDescription category image duration createdAt isPublished playCount"
			)
			.exec();
	} catch (error) {
		res.status(404).json({ message: "Error when getting episodes" });
	}

	return res.status(200).json({ previousEpisode, nextEpisode });
};

export const getAllEpisodes = async (req, res) => {
	let episodes;
	console.log(req.query);
	const { category, isPublished, search, duration, startDate, endDate } =
		req.query;

	let page = parseInt(req.query.page);
	let limit = parseInt(req.query.limit);
	if (!page || page < 1) {
		page = 1;
	}
	if (!limit || limit < 1) {
		limit = 6;
	}
	console.log(page, limit);
	let count;

	// Prepare the filter object based on query parameters
	const filter = {};
	if (category) {
		filter.category = category;
	}
	if (isPublished) {
		filter.isPublished = isPublished === "1"; // Convert string to boolean
	}

	if (duration) {
		const { minDuration, maxDuration } = durationCategory(
			parseInt(duration)
		);
		console.log(minDuration, maxDuration);
		filter.duration = { $gte: minDuration, $lte: maxDuration };
	}
	if (startDate && endDate) {
		filter.createdAt = {
			$gte: new Date(startDate),
			$lte: new Date(endDate),
		};
	} else if (startDate) {
		filter.createdAt = { $gte: new Date(startDate) };
	} else if (endDate) {
		filter.createdAt = { $lte: new Date(endDate) };
	}

	// Check if the search parameter is provided
	if (search) {
		// Split the search query into individual words
		const searchWords = search.split(" ").filter((word) => word !== "");

		// Create a regex pattern to match any of the search words in the episode title
		const regexPattern = searchWords
			.map((word) => `(?=.*${word})`)
			.join("|");

		const regexQuery = new RegExp(regexPattern, "i");

		filter.$or = [{ title: regexQuery }];
	}

	console.log(filter);
	try {
		episodes = await Episode.find(filter)
			.select(
				"id episodeNumber title smallDescription notesDescription category image duration createdAt isPublished playCount"
			)
			// We multiply the "limit" variables by one just to make sure we pass a number and not a string
			.limit(limit * 1)
			// I don't think i need to explain the math here
			.skip((page - 1) * limit)
			// We sort the data by the date of their creation in descending order (user 1 instead of -1 to get ascending order)
			.sort({ createdAt: -1 })
			.populate("category", "id title")
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
	console.log(formattedEpisodes);
	return res.status(200).json({
		totalPages: Math.ceil(count / limit),
		episodes: formattedEpisodes,
	});
};

function formatDuration(durationInSeconds) {
	const hours = parseInt(Math.floor(durationInSeconds / 3600));
	const minutes = parseInt(Math.floor((durationInSeconds % 3600) / 60));
	const seconds = parseInt(durationInSeconds % 60);

	const formattedHours = hours.toString().padStart(2, "0");
	const formattedMinutes = minutes.toString().padStart(2, "0");
	const formattedSeconds = seconds.toString().padStart(2, "0");

	return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
}

function durationCategory(duration) {
	let minDuration;
	let maxDuration;
	if (duration === 0) {
		minDuration = "00:00:00";
		maxDuration = "00:30:00";
	} else if (duration === 1) {
		minDuration = "00:30:01";
		maxDuration = "01:00:00";
	} else if (duration === 2) {
		minDuration = "01:00:01";
		maxDuration = "100:30:00";
	} else {
		minDuration = "00:00:00";
		maxDuration = "10:30:00";
	}
	console.log(minDuration, maxDuration);
	return { minDuration, maxDuration };
}

export const addEpisode = async (req, res, next) => {
	console.log(req.files);
	console.log(req.body);

	const {
		title,
		description,
		smallDescription,
		notesDescription,
		category,
		explication,
		notes,
		image,
		audio,
		duration,
		urls,
	} = req.body;
	// Check if audio and image files are present
	if (
		!image ||
		!audio ||
		!title ||
		!description ||
		!category || // Make sure notes are present
		!explication ||
		!duration
	) {
		// Make sure notes is an array) {
		return res.status(400).json({
			message: "title, description, category, audio url, image url, duration and explication are required",
		});
	}
	let existingCategory;
	try {
		// Validate the categoryId
		if (!mongoose.Types.ObjectId.isValid(category)) {
			return res.status(400).json({ message: "Invalid categoryId" });
		}

		existingCategory = await Category.findById(category);
	} catch (error) {
		return console.log(error);
	}

	if (!existingCategory) {
		return res.status(404).json({ message: "category not found" });
	}

	// Create an array to store the created note IDs
	const noteIds = [];
	if (notes) {
		// Loop through the notes array and create note documents
		for (const note of notes) {
			const { note: noteText, time } = note;
			const noteDocument = new Note({
				note: noteText,
				time,
			});
			try {
				// Save the note document
				const savedNote = await noteDocument.save();
				// Push the note ID to the array
				noteIds.push(savedNote._id);
			} catch (error) {
				console.log(error);
				return res
					.status(500)
					.json({ message: "Adding notes failed" });
			}
		}
	}

	const episode = new Episode({
		title,
		description,
		category,
		image,
		audio,
		duration,
		explication,
		notes: noteIds,
		urls,
	});

	try {
		await episode.save();
	} catch (error) {
		console.log(error);
		return res.status(500).json({ message: "adding episode failed" });
	}

	return res.status(200).json({ episode });
};

// Route to handle the PATCH request for updating episode fields
export const updateEpisode = async (req, res) => {
	const episodeId = req.params.id;
	const updates = req.body;
	console.log(updates);
	try {
		// Verify and validate the updates
		const allowedUpdates = [
			"title",
			"description",
			"isPublished",
			"category",
			"image",
			"image.name",
			"image.size",
			"image.url",
			"audio",
			"episodeNumber",
			"explication",
			"duration",
			"urls",
			"smallDescription",
			" notesDescription",
		];
		const isValidOperation = Object.keys(updates).every((update) =>
			allowedUpdates.includes(update)
		);

		if (!isValidOperation) {
			return res.status(400).json({ error: "Invalid updates" });
		}

		// Find the episode by ID
		const episode = await Episode.findById(episodeId);

		if (!episode) {
			return res.status(404).json({ error: "Episode not found" });
		}

		if (updates.category) {
			// Validate the categoryId
			if (!mongoose.Types.ObjectId.isValid(updates.category)) {
				return res
					.status(400)
					.json({ message: "Invalid categoryId" });
			}
			let existingCategory;
			try {
				existingCategory = await Category.findById(
					updates.category
				);
			} catch (error) {
				return console.log(error);
			}

			if (!existingCategory) {
				return res
					.status(404)
					.json({ message: "category not found" });
			}
		}

		// Apply updates to the episode
		Object.assign(episode, updates);

		// Save the updated episode
		const updatedEpisode = await episode.save();

		res.json(updatedEpisode);
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: "Server error" });
	}
};

export const toggleIsPublished = async (req, res, next) => {
	const _id = req.params.id;
	let episode;
	try {
		episode = await Episode.findOneAndUpdate({ _id }, [
			{ $set: { isPublished: { $eq: [false, "$isPublished"] } } },
		]);
	} catch (err) {
		console.log(err);
		return res.status(500).json({ message: "Server error" });
	}

	if (!episode) {
		return res.status(404).json({ message: "Episode not found" });
	}

	res.status(200).json({ success: true });
};

export const getById = async (req, res, next) => {
	const id = req.params.id;
	let episode;
	try {
		episode = await Episode.findById(id)
			.select(
				"id episodeNumber title description smallDescription notesDescription explication category audio image duration createdAt notes playCount urls comments"
			)
			.populate({
				path: "category",
				select: "id title", // Select the fields you want to populate for the "category"
			})
			.populate({
				path: "comments",
				select: "id content user createdAt updatedAt",
				options: { sort: { createdAt: -1 } },
				populate: {
					path: "user",
					model: "User", // This should match the model name "User" defined in the user schema
					select: {
						id: 1,
						name: {
							$cond: [
								{ $ifNull: ["$local.name", false] },
								"$local.name",
								{
									$cond: [
										{
											$ifNull: [
												"$google.name",
												false,
											],
										},
										"$google.name",
										"$facebook.name",
									],
								},
							],
						},
						username: {
							$cond: [
								{ $ifNull: ["$local.username", false] },
								"$local.username",
								{
									$cond: [
										{
											$ifNull: [
												"$google.username",
												false,
											],
										},
										"$google.username",
										"$facebook.username",
									],
								},
							],
						},
					},
				},
			})
			.populate("notes", "note time");
	} catch (err) {
		return console.log(err);
	}

	if (!episode) {
		return res.status(404).json({ message: "Episode not found" });
	}

	const createdAt = episode.createdAt.toISOString().split("T")[0];
	const formattedEpisode = { ...episode._doc, createdAt };

	// Send the episode data including the image Base64 in the response
	res.status(200).json({ episode: formattedEpisode });
};

export const getAudioById = async (req, res, next) => {
	const id = req.params.id;
	let episode;
	try {
		episode = await Episode.findById(id).select("audio");
	} catch (err) {
		return console.log(err);
	}

	if (!episode) {
		return res.status(404).json({ message: "Episode not found" });
	}

	// Set appropriate headers for streaming or chunked response
	res.set({
		"Content-Type": "audio/mpeg",
		"Transfer-Encoding": "chunked",
	});

	// Create a readable stream from the audio file
	const readStream = fs.createReadStream(episode.audio);

	// Pipe the stream to the response object
	readStream.pipe(res);
};

export const deleteEpisodeById = async (req, res, next) => {
	const id = req.params.id;
	//TODO: delete notes
	let episode;
	try {
		episode = await Episode.findByIdAndRemove(id);
	} catch (error) {
		console.log(error);
		return res.status(404).json({ message: "unable to delete" });
	}

	if (!episode) {
		return res.status(404).json({ message: "Episode not found" });
	}

	return res.status(200).json({ message: "succesfelly deleted" });
};

export const getUserEpisodes = async (req, res, next) => {
	const userId = req.params.id;
	let userEpisodes;
	try {
		userEpisodes = await User.findById(userId).populate("episodes");
	} catch (error) {
		return console.log(error);
	}

	if (!userEpisodes) {
		return res.status(404).json({ episodes: userEpisodes });
	}

	return res.status(200).json({ episodes: userEpisodes });
};

export const addNote = async (req, res, next) => {
	const { note, time } = req.body;
	const episodeId = req.params.id;

	console.log(req.body);
	// Check if audio and image files are present
	if (!note || !time) {
		// Make sure notes is an array) {
		return res
			.status(400)
			.json({ message: "note and time are required" });
	}
	let existingEpisode;
	try {
		// Validate the categoryId
		if (!mongoose.Types.ObjectId.isValid(episodeId)) {
			return res.status(400).json({ message: "Invalid episodeId" });
		}

		existingEpisode = await Episode.findById(episodeId);
	} catch (error) {
		return console.log(error);
	}

	if (!existingEpisode) {
		return res.status(404).json({ message: "episode not found" });
	}

	// Loop through the notes array and create note documents

	const noteDocument = new Note({
		note,
		time,
	});
	let noteId;
	try {
		// Save the note document
		const savedNote = await noteDocument.save();
		// Push the note ID to the array
		noteId = savedNote._id;
	} catch (error) {
		console.log(error);
		return res.status(500).json({ message: "Adding notes failed" });
	}

	existingEpisode.notes.push(noteId);

	try {
		await existingEpisode.save();
	} catch (error) {
		console.log(error);
		return res
			.status(500)
			.json({ message: "adding note to episode failed" });
	}

	return res.status(200).json({ existingEpisode });
};

export const deleteNote = async (req, res, next) => {
	const id = req.params.id;
	const noteId = req.params.noteId;

	let episode;
	let note;
	try {
		episode = await Episode.findById(id);
	} catch (error) {
		return console.log(error);
	}

	if (!episode) {
		return res.status(404).json({ message: "episode not found" });
	}

	try {
		note = await Note.findByIdAndRemove(noteId);
	} catch (error) {
		return console.log(error);
	}

	if (!note) {
		return res.status(404).json({ message: "note not found" });
	}

	episode.notes.pop(note._id);
	await episode.save();

	return res.status(200).json({ message: "succesfelly deleted" });
};

export const addComment = async (req, res) => {
	const episodeId = req.params.id;
	const { content } = req.body;
	const user = req.user._id;
	let existingEpisode;
	try {
		// Validate the categoryId
		if (!mongoose.Types.ObjectId.isValid(episodeId)) {
			return res.status(400).json({ message: "Invalid episode Id" });
		}

		existingEpisode = await Episode.findById(episodeId);
	} catch (error) {
		return console.log(error);
	}

	if (!existingEpisode) {
		return res.status(404).json({ message: "episode not found" });
	}

	// Loop through the comments array and create comment documents

	const commentDocument = new Comment({
		content,
		user,
	});
	let commentId;
	try {
		// Save the comment document
		const savedComment = await commentDocument.save();
		// Push the comment ID to the array
		commentId = savedComment._id;
	} catch (error) {
		console.log(error);
		return res.status(500).json({ message: "Adding comments failed" });
	}

	existingEpisode.comments.push(commentId);

	try {
		await existingEpisode.save();
	} catch (error) {
		console.log(error);
		return res
			.status(500)
			.json({ message: "adding comment to episode failed" });
	}

	return res.status(200).json({ existingEpisode });
};

export const deleteComment = async (req, res, next) => {
	const id = req.params.id;
	const commentId = req.params.commentId;
	const user = req.user;
	let episode;
	let comment;
	try {
		episode = await Episode.findById(id);
	} catch (error) {
		return console.log(error);
	}

	if (!episode) {
		return res.status(404).json({ message: "episode not found" });
	}

	try {
		comment = await Comment.findById(commentId);
	} catch (error) {
		return console.log(error);
	}

	if (!comment) {
		return res.status(404).json({ message: "comment not found" });
	}
	const userId = new ObjectId(user._id);

	if (!comment.user.equals(userId) && user.role !== "admin") {
		return res.status(401).json({ message: "Unauthorized" });
	}
	episode.comments.pop(comment._id);

	await episode.save();

	return res.status(200).json({ message: "succesfelly deleted" });
};
