import mongoose from "mongoose";

const Schema = mongoose.Schema;

const noteSchema = new Schema({
   
    note: {
        type: String,
        required: true,

    },
    time:{
        type: String,
        required: true
    }
   
});

export default mongoose.model("Note", noteSchema);