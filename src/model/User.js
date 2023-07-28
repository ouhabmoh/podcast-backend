import mongoose from "mongoose";
import passportLocalMongoose from "passport-local-mongoose";

const Schema = mongoose.Schema;

const userSchema = Schema(
  {
    google: {
      id: {
        type: String,
      },
      name: {
        type: String,
      },
      email: {
        type: String,
      },
    },
    local: {
      email: {
        type: String,
        unique: true,
      },
      username: {
        type: String,
        unique: true,
      },
      // The password field will be added by passport-local-mongoose
    },
    role: {
      type: String,
      default: "user",
    },
    status: {
      type: String,
      default: "active",
    },
  },
  { timestamps: true }
);

userSchema.plugin(passportLocalMongoose, {
  usernameField: "emailOrUsername", // The field name to accept email or username
});

export default mongoose.model("User", userSchema);
