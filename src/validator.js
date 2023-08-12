import { body, validationResult } from "express-validator";

export const episodeValidationRules = () => {
	return [
		// title field validation
		body("title")
			.notEmpty()
			.withMessage("Title is required")
			.isString()
			.withMessage("Title must be a string")
			.isLength({ min: 3, max: 100 })
			.withMessage("Title must be between 3 and 100 characters"),

		// description field validation
		body("description")
			.notEmpty()
			.withMessage("Description is required")
			.isString()
			.withMessage("Description must be a string")
			.isLength({ min: 5, max: 500 })
			.withMessage("Description must be between 5 and 500 characters"),

		// category field validation
		body("category").notEmpty().withMessage("Category is required"),

		// audio field validation
		body("audio.name")
			.notEmpty()
			.withMessage("Audio filename is required")
			.isString()
			.withMessage("Audio filename must be a string"),

		body("image.name")
			.notEmpty()
			.withMessage("Image filename is required")
			.isString()
			.withMessage("Image filename must be a string"),

		// audio field validation
		body("audio.url")
			.notEmpty()
			.withMessage("Audio URL is required")
			.isURL()
			.withMessage("Audio URL must be a valid URL"),

		// image field validation
		body("image.url")
			.notEmpty()
			.withMessage("Image URL is required")
			.isURL()
			.withMessage("Image URL must be a valid URL"),

		// audio field validation
		body("audio.size")
			.notEmpty()
			.withMessage("Audio size is required")
			.isFloat()
			.withMessage("Audio size must be a float"),

		// image field validation
		body("image.size")
			.notEmpty()
			.withMessage("Image size is required")
			.isFloat()
			.withMessage("Image must be a float"),

		// duration field validation
		body("duration").notEmpty().withMessage("Duration is required"),

		// explication field validation (optional)
		body("explication")
			.notEmpty()
			.withMessage("Explication is required")
			.isString()
			.withMessage("Explication must be a string"),

		// notes field validation (optional)
		body("notes")
			.optional()
			.isArray()
			.withMessage("Notes must be an array"),
		body("notes.*.note")
			.optional()
			.isString()
			.withMessage("Note must be a string"),
		body("notes.*.time")
			.optional()
			.isString()
			.withMessage("Time must be a string"),
	];
};

export const validate = (req, res, next) => {
	const errors = validationResult(req);
	if (errors.isEmpty()) {
		return next();
	}
	const extractedErrors = [];
	errors
		.array()
		.map((err) => extractedErrors.push({ [err.param]: err.msg }));

	return res.status(422).json({
		errors: extractedErrors,
	});
};
