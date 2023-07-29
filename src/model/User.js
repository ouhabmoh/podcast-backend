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
        
      },
      username: {
        type: String,
        
      },
      // The password field will be added by passport-local-mongoose
    },
    role: {
      type: String,
      default: "User",
    },
    status: {
      type: String,
      default: "Active",
    },
  },
  { timestamps: true }
);

userSchema.plugin(passportLocalMongoose, {
  usernameField: "local.emailOrUsername", // The field name to accept email or username
});

export default mongoose.model("User", userSchema);
