import { Strategy as GoogleStrategy } from "passport-google-oauth2";
import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as FacebookStrategy } from "passport-facebook";
import passport from "passport";
import dotenv from "dotenv";
dotenv.config();
import confirmEmail from "../utils/emailValidation.js";
import User from "../model/User.js";

passport.use(
	new GoogleStrategy(
		{
			clientID: process.env.CLIENT_ID,
			clientSecret: process.env.CLIENT_SECRET,
			callbackURL: process.env.GOOGLE_CALL_BACK_URL,
			passReqToCallback: true,
		},
		async (request, accessToken, refreshToken, profile, done) => {
			try {
				console.log(profile);
				let existingUser = await User.findOne({
					"google.id": profile.id,
				});

				if (existingUser) {
					existingUser.method = "google";
					return done(null, existingUser);
				}

				console.log("Creating new user...");

				const newUser = new User({
					method: "google",
					google: {
						id: profile.id,
						name: profile.displayName,
						email: profile.emails[0].value,
						username: generateUsername(profile.displayName),
					},
				});
				await newUser.save();
				newUser.method = "google";
				return done(null, newUser);
			} catch (error) {
				return done(error, false);
			}
		}
	)
);

passport.use(
	new JwtStrategy(
		{
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			secretOrKey: process.env.JWT_SECRET_KEY,
		},
		async (jwtPayload, done) => {
			try {
				// <em>// Extract user</em>
				const user = jwtPayload.user;
				done(null, user);
			} catch (error) {
				done(error, false);
			}
		}
	)
);

// passport.use(
//   "local",
//   new LocalStrategy(
//     {
//       usernameField: "emailOrUsername", // The field name to accept email or username
//     },
//     async (emailOrUsername, password, done) => {
//       try {
//         // Check if the provided emailOrUsername exists in the database
//         const user = await User.findOne({
//           $or: [{ "local.email": emailOrUsername }, { "local.username": emailOrUsername }],
//         });

//         // If user not found or password is incorrect, return false
//         if (!user || !user.validPassword(password)) {
//           return done(null, false);
//         }

//         // If user is found and password is correct, return the user
//         return done(null, user);
//       } catch (error) {
//         return done(error);
//       }
//     }
//   )
// );

passport.use("local-login", new LocalStrategy(User.authenticate()));

passport.use(
	"local-register",
	new LocalStrategy(
		{
			// by default, local strategy uses username and password, we will override with email
			usernameField: "username",
			passwordField: "password",
			passReqToCallback: true, // allows us to pass back the entire request to the callback
		},

		async function (req, username, password, done) {
			console.log(req.body);
			const email = req.body.email;
			const name = req.body.name;
			// find a user whose email is the same as the forms email
			// we are checking to see if the user trying to login already exists
			let user;
			try {
				user = await User.findOne({
					$or: [
						{ "local.email": email },
						{ "local.username": username },
					],
				});
				console.log("existing user");
				console.log(user);
			} catch (e) {
				console.log(e);
				return done(e);
			}

			// if there are any errors, return the error

			if (user) {
				console.log("user exist");
				return done(null, false, {
					message: "email/username is already taken.",
				});
			}

			let newUser;
			try {
				newUser = await User.register(
					new User({
						"local.email": email,
						"local.username": username,
						"local.name": name,
					}),
					password
				);

				confirmEmail(newUser);
			} catch (err) {
				console.log(err);
				return done(err);
			}
			console.log("Registered");
			newUser.method = "local";
			return done(null, newUser);
		}
	)
);

passport.use(
	new FacebookStrategy(
		{
			clientID: process.env.FACEBOOK_APP_ID,
			clientSecret: process.env.FACEBOOK_APP_SECRET,
			callbackURL: process.env.FACEBOOK_CALL_BACK_URL,
			profileFields: ["id", "displayName", "photos", "email"],
			state: false,
			enableProof: true,
		},
		async function verify(accessToken, refreshToken, profile, cb) {
			try {
				console.log(profile);
				let existingUser = await User.findOne({
					"facebook.id": profile.id,
				}).exec();

				if (existingUser) {
					existingUser.method = "facebook";
					console.log(existingUser);
					return cb(null, existingUser);
				}

				console.log("Creating new user...");

				const newUser = new User({
					method: "facebook",
					facebook: {
						id: profile.id,
						name: profile.displayName,
						email: profile.email,
						username: generateUsername(profile.displayName),
					},
				});
				await newUser.save();
				newUser.method = "facebook";
				console.log(newUser);
				return cb(null, newUser);
			} catch (error) {
				return cb(error, false);
			}
		}
	)
);

function generateUsername(fullName) {
	const normalizedFullName = fullName
		.toLowerCase()
		.replace(/[^a-z0-9]/g, "."); // Replace non-alphanumeric characters with dots
	return normalizedFullName;
}

export default passport;
