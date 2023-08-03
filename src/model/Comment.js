import mongoose from "mongoose";

const Schema = mongoose.Schema;

const commentSchema = new Schema({
   
    content: {
        type: String,
        required: true,

    },
   
    user: {
        type: mongoose.Types.ObjectId,
        ref: "User",
        required: true
      },
},
{ timestamps: true });

export default mongoose.model("Comment", articleSchema);