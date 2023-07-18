import mongoose from "mongoose";

const Schema = mongoose.Schema;

const episodeSchema = new Schema({
    episodeNumber: {
        type: Number,
        required: true,

    },
    title: {
        type: String,
        required: true,

    },
    description:{
        type: String,
        required: true
    },
    category: {
        type: mongoose.Types.ObjectId,
        ref: "Category",
        required: true
      },
    image: {
        type: String,
        required:true
        
    },
    audio: {
        type: String,
        required:true
        
    },
    isPublished: {
        type: Boolean,
        default: true,
        required:true
        
    },
   
});

export default mongoose.model("Episode", episodeSchema);