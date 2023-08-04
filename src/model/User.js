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
    facebook: {
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
  usernameField: "local.username", // The field name to accept email or username
  hashField: "local.hash", // 

  usernameUnique: false
});

// Define a virtual field for filledFields
userSchema.virtual("loginMethod").get(function () {
  const filledFields = {};

  if (this.google && Object.keys(this.google).length > 0) {
    filledFields.google = this.google;
  }
  if (this.facebook && Object.keys(this.facebook).length > 0) {
    filledFields.facebook = this.facebook;
  }
  if (this.local && Object.keys(this.local).length > 0) {
    filledFields.local = this.local;
  }

  return filledFields;
});
export default mongoose.model("User", userSchema);
