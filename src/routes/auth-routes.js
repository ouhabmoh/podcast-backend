import  express  from "express";
import passport from "../passportConfig.js";
import  {signToken} from "../jwt.js";


const authRouter = express.Router();
authRouter.get(
    "/google",
    passport.authenticate("google", { scope: ["email", "profile"] })
  );

authRouter.get(
    "/facebook",
    passport.authenticate("facebook")
  );


authRouter.post("/login", (req, res, next) => {

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

authRouter.post("/register", (req, res, next) => {
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
authRouter.get(
    "/google/callback",
    passport.authenticate("google", { session: false,
      successRedirect: '/profile',
      failureRedirect: 'auth/login'
    }),
    async (req, res) => {

      const user = req.user
      if (!user) {
        return res.status(400).json({ message: info.message });
      }
      // If registration is successful, sign a JWT token and send it in the response
      const token = await signToken(user);
     
      return res.status(200).json({ token: token });
    }
  );


authRouter.get(
    "/facebook/callback",
    passport.authenticate("facebook", { session: false}),
    async (req, res) => {

      const user = req.user
      if (!user) {
        return res.status(400).json({ message: info.message });
      }
      // If registration is successful, sign a JWT token and send it in the response
      const token = await signToken(user);
     
      return res.status(200).json({ token: token });
    }
  );



export default authRouter;


