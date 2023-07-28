import { Strategy as GoogleStrategy } from "passport-google-oauth2";
import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";
import { Strategy as LocalStrategy } from "passport-local";


import User from "./model/User.js";

export default async function passportConfig(passport) {
    passport.use(new GoogleStrategy({
        clientID: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        callbackURL: "http://localhost:5000/auth/google/callback",
        passReqToCallback : true
      },
      async (request, accessToken, refreshToken, profile, done) => {
        try {
            console.log(profile);
            let existingUser = await User.findOne({ 'google.id': profile.id });
           
            if (existingUser) {
              return done(null, existingUser);
            }
          
            console.log('Creating new user...');
            
            const newUser = new User({
              method: 'google',
              google: {
                id: profile.id,
                name: profile.displayName,
                email: profile.emails[0].value
              }
            });
            await newUser.save();
            return done(null, newUser);
        } catch (error) {
            return done(error, false)
        }
      }
    ));

    passport.use(
        new JwtStrategy(
          {
            jwtFromRequest: ExtractJwt.fromHeader("authorization"),
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

      passport.use(
        "local",
        new LocalStrategy(
          {
            usernameField: "emailOrUsername", // The field name to accept email or username
          },
          async (emailOrUsername, password, done) => {
            try {
              // Check if the provided emailOrUsername exists in the database
              const user = await User.findOne({
                $or: [{ "local.email": emailOrUsername }, { "local.username": emailOrUsername }],
              });
      
              // If user not found or password is incorrect, return false
              if (!user || !user.validPassword(password)) {
                return done(null, false);
              }
      
              // If user is found and password is correct, return the user
              return done(null, user);
            } catch (error) {
              return done(error);
            }
          }
        )
      );
};
