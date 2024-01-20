export default function constructFilters(options) {
	const { isPublished, search, readTime, startDate, endDate, category } =
		options;
	const filter = {};
	if (isPublished) {
		filter.isPublished = isPublished === "1";
	}
	if (category) {
		filter.category = category;
	}
	if (readTime) {
		const { minTime, maxTime } = readTimeCategory(parseInt(readTime));
		filter.readTime = { $gte: minTime, $lte: maxTime };
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
	if (search) {
		// Split the search query into individual words
		const searchWords = search.split(" ").filter((word) => word !== "");

		// Create a regex pattern to match any of the search words in the article title
		const regexPattern = searchWords
			.map((word) => `(?=.*${word})`)
			.join("|");

		const regexQuery = new RegExp(regexPattern, "i");

		filter.$or = [{ title: regexQuery }];
	}

	return filter;
}

const readTimeCategory = (readTimeCategoryNumber) => {
	let minDuration, maxDuration;

	switch (readTimeCategoryNumber) {
		case 0:
			minDuration = 0;
			maxDuration = 10;
			break;
		case 1:
			minDuration = 11;
			maxDuration = 20;
			break;
		case 2:
			minDuration = 21;
			maxDuration = 30;
			break;
		case 3:
			minDuration = 31;
			maxDuration = 60;
			break;
		default:
			// For any other number, assume less than 15 minutes
			minDuration = 0;
			maxDuration = 600;
			break;
	}

	return { minDuration, maxDuration };
};
