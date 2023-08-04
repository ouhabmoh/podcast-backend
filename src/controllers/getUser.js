import User from "../model/User.js";
import mongoose from "mongoose";

export const getUser = async (userId) => {
  try {
    console.log(userId);
    const user = await User.aggregate([
        { $match: { _id: userId } },
        {
          $project: {
            loginMethod: {
              $cond: [
                { $ne: ['$google.id', null] },
                'id google.name',
                {
                  $cond: [
                    { $ne: ['$facebook.id', null] },
                    'id facebook.name',
                    'id username'
                  ]
                }
              ]
            },
            role: 1,
            status: 1,
            createdAt: 1,
            updatedAt: 1
          }
        }
      ]);
    console.log(user);
    if (!user || user.length === 0) {
      // User not found
      return null;
    }

    // Return the user as needed
    return user[0];
  } catch (error) {
    // Handle errors
    console.error(error);
    return null;
  }
};
