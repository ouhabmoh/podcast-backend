
import jwt from "jsonwebtoken";
export const signToken = (user) => {
    return new Promise((resolve, reject) => {
      jwt.sign(
        { user: user },
        process.env.JWT_SECRET_KEY,
        { expiresIn: process.env.TOKEN_EXPIRATION_TIME },
        (err, token) => {
          if (err) {
            reject(err);
          } else {
           
            resolve(token);
          }
        }
      );
    });
  };