import passport from "./passportConfig.js";
export const isAdmin = (req, res, next) => {
	// passport.authenticate('jwt', { session: false }, (err, user) => {
	//     console.log(user);
	//     if (err) {
	//         console.log(err);
	//         return res.status(401).json({ message: 'Unauthorized' });
	//       }
	//       if(!user) {
	//         return res.status(401).json({ message: 'Unauthorized' });
	//       }

	//       if (user.role !== 'admin') {
	//         return res.status(403).json({ message: 'Forbidden - Admin access required' });
	//       }

	//   req.user = user;
	// //   next();
	// })
	req, res, next;
};

export const notAdmin = (req, res, next) => {
	// passport.authenticate('jwt', { session: false }, (err, user) => {

	//   //     if (!user || user.role !== 'admin') {
	//   //       req.query.isPublished = '1';
	//   //     }

	//   // req.user = user;
	//   next();
	// })
	req, res, next;
};

export const isLoggedIn = (req, res, next) => {
	passport.authenticate("jwt", { session: false }, (err, user) => {
		console.log("jwt ver");
		if (err || !user) {
			console.log(err);
			// If authentication fails, you can handle the error or respond with an unauthorized status code
			return res
				.status(401)
				.json({ error: "Invalid token or token expired" });
		}
		// If authentication is successful, store the authenticated user in the request object

		req.user = user;
		console.log(req.user);
		next();
	})(req, res, next);
};
