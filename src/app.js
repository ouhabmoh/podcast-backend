import express from "express";
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';

import jwt from "jsonwebtoken";
import passport from "./passportConfig.js";
import  {signToken} from "./jwt.js";
import userRouter from "./routes/user-routes.js";
import episodeRouter from "./routes/episode-routes.js";
import categoryRouter  from "./routes/category-routes.js";  
import infoRouter from "./routes/info-routes.js";
import noteRouter from "./routes/note-routes.js";
const app = express();
app.timeout = 300000;

dotenv.config();
mongoose.connect("mongodb://ismmoh:wPLMCu9SObXxfK8a@ac-bp6oqvh-shard-00-00.3x6gazm.mongodb.net:27017,ac-bp6oqvh-shard-00-01.3x6gazm.mongodb.net:27017,ac-bp6oqvh-shard-00-02.3x6gazm.mongodb.net:27017/?ssl=true&replicaSet=atlas-w68tpt-shard-0&authSource=admin&retryWrites=true&w=majority")
        .then(() => console.log("db"))
        .catch((e) => console.log(e));


        app.get("/test", () => {
            console.log("test is succ")
        })



// import crypto from 'crypto';

// const secretKey = crypto.randomBytes(32).toString('hex');
// console.log(secretKey);
// enabling CORS for any unknown origin(https://xyz.example.com)
app.use(cors());
app.use(express.json({ limit: '500mb' }))
app.get(
    "/auth/google",
    passport.authenticate("google", { scope: ["email", "profile"] })
  );


app.post("/auth/login", (req, res, next) => {

  passport.authenticate('local-login', async (err, user, info) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.status(400).json({ message: info.message });
    }
    // If registration is successful, sign a JWT token and send it in the response
    const token = await signToken(user);
   
    return res.status(200).json({ token: token });
  })(req, res, next);
});

app.post("/auth/register", (req, res, next) => {
  passport.authenticate('local-register', async (err, user, info) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.status(400).json({ message: info.message });
    }
    // If registration is successful, sign a JWT token and send it in the response
    const token = await signToken(user);
   
    return res.status(200).json({ token: token });
  })(req, res, next);
});
  app.get(
    "/auth/google/callback",
    passport.authenticate("google", { session: false,
      successRedirect: '/profile',
      failureRedirect: 'auth/login'
    }),
    (req, res) => {
      jwt.sign(
        { user: req.user },
        process.env.JWT_SECRET_KEY,
        { expiresIn: process.env.TOKEN_EXPIRATION_TIME },
        (err, token) => {
          if (err) {
            return res.json({
              token: null,
            });
          }
          res.status(200).json({
            token,
          });
        }
      );
    }
  );
  app.get(
    "/profile",
    passport.authenticate("jwt", { session: false,
      failureRedirect: 'auth/login'
    }),
    (req, res, next) => {
      res.send("Welcome");
    }
  );
app.use('/resources',express.static('resources'))
app.use("/users",userRouter);
app.use("/notes", noteRouter);
app.use("/episodes", episodeRouter);
app.use("/categories", categoryRouter);
app.use("/infos", infoRouter);

app.listen(process.env.PORT || 5000, () =>{
    console.log("backend is running");
});

// Export the app and the serverless function
export default app;
