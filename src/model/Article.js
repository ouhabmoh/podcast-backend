import mongoose from "mongoose";

const Schema = mongoose.Schema;

const articleSchema = new Schema({

    articleNumber:{
        type: Number,
    }
   ,
    title: {
        type: String,
        required: true,

    },
    description:{
        type: String,
        required: true
    },
    content:{
        type: String,
        required: true
    },
    image: {
        type: String,
        required:true
        
    },
    readTime:{
        type: String,
        required: true
    },
    isPublished: {
        type: Boolean,
        default: true,
        required:true
        
    },
    category: {
        type: mongoose.Types.ObjectId,
        ref: "Category",
        required: true
      },
},
{ timestamps: true });

export default mongoose.model("Article", articleSchema);