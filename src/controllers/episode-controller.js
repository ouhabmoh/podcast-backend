import Category from "../model/Category.js";
import Episode from "../model/Episode.js";
import User from "../model/User.js";
import Note from "../model/Note.js";
import { getAudioDurationInSeconds } from 'get-audio-duration';
import mongoose from "mongoose";
import mp3Duration from 'mp3-duration';
import cloudinary from 'cloudinary';
import handleUpload from "../helper.js";
import fs from 'fs';
import path from 'path';
// export const getAllEpisodes = async (req, res, next) => {
//     let episodes;
//     try {
//         episodes = await Episode.find();
//     } catch (error) {
//         return console.log(error);
//     }

//     if(!episodes){
//         res.status(404).json({message : "No Episodes Found"});
//     }

//     return res.status(200).json({episodes});
    
// }
// const limit = 10;

export const getAllEpisodes = async (req, res) => {
    let episodes;
    let page = parseInt(req.query.page);
    let limit = parseInt(req.query.limit);
    if (!page || page < 1) { page = 1;}
    if(!limit || limit < 1){ limit = 6;}
    let count;
    try {
      episodes = await Episode.find({ isPublished: true })
        .select('id episodeNumber title category image duration createdAt')
        // We multiply the "limit" variables by one just to make sure we pass a number and not a string
        .limit(limit * 1)
        // I don't think i need to explain the math here
        .skip((page - 1) * limit)
        // We sort the data by the date of their creation in descending order (user 1 instead of -1 to get ascending order)
        .sort({ createdAt: -1 })
        .populate('category', 'id title')
        .exec();
        // Getting the numbers of products stored in database
        count = await Episode.countDocuments();
    }catch (error) {
        res.status(404).json({message : "Error when getting episodes"});
    }
    if(!episodes){
        res.status(404).json({message : "No Episodes Found"});
    }
    const formattedEpisodes = episodes.map((episode) => {
        const createdAt = episode.createdAt.toISOString().split('T')[0];
        return { ...episode._doc, createdAt };
      });
    
  return res.status(200).json({ totalPages: Math.ceil(count / limit), episodes : formattedEpisodes});
};
  
function formatDuration(durationInSeconds) {
  const hours =  parseInt(Math.floor(durationInSeconds / 3600));
  const minutes = parseInt(Math.floor((durationInSeconds % 3600) / 60));
  const seconds = parseInt(durationInSeconds % 60);

  const formattedHours = hours.toString().padStart(2, "0");
  const formattedMinutes = minutes.toString().padStart(2, "0");
  const formattedSeconds = seconds.toString().padStart(2, "0");

  return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
}

export const addEpisode = async (req, res, next) => {
  console.log(req.files)
  console.log(req.body);

    const {episodeNumber, title, description, category, notes, explication} = req.body;
     // Check if audio and image files are present
    if (!req.files || !req.files['audio'] || !req.files['image'] || !episodeNumber || !title || !description || !category ||  // Make sure notes are present
      !explication ){// Make sure notes is an array) {
    return res.status(400).json({ message: 'episodeNumber, title, description, category, audio, image files and explication are required' });
  }
    let existingCategory;
    try {
            // Validate the categoryId
    if (!mongoose.Types.ObjectId.isValid(category)) {
        return res.status(400).json({ message: 'Invalid categoryId' });
    }

        existingCategory = await Category.findById(category);
    } catch (error) {
        return console.log(error)
    }

    if(!existingCategory){
        return res.status(404).json({message:"category not found"});
    }
    // console.log(req.files['audio'][0].buffer);
let audio = req.files['audio'][0]['path'];
    console.log(audio);
    // The uploaded image files can be accessed through req.files['image']
  let image = req.files['image'][0]['path'];
    console.log(image);

//     // Calculate the duration using getAudioDurationInSeconds
//   const durationInSeconds = await getAudioDurationInSeconds(req.files['audio'][0].buffer);

// // Convert duration to minutes and round it up
//   const durationInMinutes = Math.ceil(durationInSeconds / 60);
//     console.log(durationInMinutes);
console.log(req.files['audio'][0])
try {
let b64 = Buffer.from(req.files['audio'][0].buffer).toString("base64");
    let dataURI = "data:" + req.files['audio'][0].mimetype + ";base64," + b64;
    let cldRes = await handleUpload(dataURI);
  // const url =  await cloudinary.url(cldRes.asset_id, {streaming_profile: "auto", resource_type: "audio"})
    console.log(cldRes);
    audio = cldRes.secure_url 
      // console.log(url);
      b64 = Buffer.from(req.files['image'][0].buffer).toString("base64");
      dataURI = "data:" + req.files['image'][0].mimetype + ";base64," + b64;
      cldRes = await handleUpload(dataURI);
    // const url =  await cloudinary.url(cldRes.asset_id, {streaming_profile: "auto", resource_type: "audio"})
      console.log(cldRes);
      image = cldRes.secure_url   
  } catch (error) {
    console.log("bbbb")
    console.log(error);
    res.send({
      message: error.message,
    });
  }

const durationInSeconds = await mp3Duration(req.files['audio'][0].buffer);
const durationInMinutes = formatDuration(durationInSeconds);
console.log(durationInMinutes);



   // Create an array to store the created note IDs
   const noteIds = [];

   // Loop through the notes array and create note documents
   for (const note of notes) {
     const { note: noteText, time } = note;
     const noteDocument = new Note({
       note: noteText,
       time,
     });
     try {
       // Save the note document
       const savedNote = await noteDocument.save();
       // Push the note ID to the array
       noteIds.push(savedNote._id);
     } catch (error) {
       console.log(error);
       return res.status(500).json({ message: 'Adding notes failed' });
     }
   }
 


    const episode = new Episode({
        episodeNumber, title, description,category, image, audio, duration:durationInMinutes, notes:noteIds, explication
    });

    try {
        await episode.save();

    } catch (error) {
         console.log(error);
         return res.status(500).json({message:"adding episode failed"});
    }

    return res.status(200).json({episode});
}

// Assume you have already imported necessary dependencies and defined the Episode model

// Route to handle the PATCH request for updating episode fields
export const updateEpisode =  async (req, res) => {
    const episodeId = req.params.id;
    const updates = req.body;
    console.log(updates);
    try {
        // Verify and validate the updates
      const allowedUpdates = ['title', 'description', 'isPublished', 'category', 'image', 'audio', 'episodeNumber', 'explication'];
      const isValidOperation = Object.keys(updates).every((update) => allowedUpdates.includes(update));
  
      if (!isValidOperation) {
        return res.status(400).json({ error: 'Invalid updates' });
      }

      // Find the episode by ID
      const episode = await Episode.findById(episodeId);
  
      if (!episode) {
        return res.status(404).json({ error: 'Episode not found' });
      }
  
      
      if(updates.category){
                // Validate the categoryId
        if (!mongoose.Types.ObjectId.isValid(updates.category)) {
            return res.status(400).json({ message: 'Invalid categoryId' });
        }
        let existingCategory;
        try {
            existingCategory = await Category.findById(updates.category);
        } catch (error) {
            return console.log(error)
        }
    
        if(!existingCategory){
            return res.status(404).json({message:"category not found"});
        }
      }

      if(req.files['audio']){
        try {
          const b64 = Buffer.from(req.files['audio'][0].buffer).toString("base64");
              const dataURI = "data:" + req.files['audio'][0].mimetype + ";base64," + b64;
              const cldRes = await handleUpload(dataURI);
            // const url =  await cloudinary.url(cldRes.asset_id, {streaming_profile: "auto", resource_type: "audio"})
              console.log(cldRes);
              updates.audio = cldRes.secure_url 
            
            } catch (error) {
              console.log("bbbb")
              console.log(error);
              res.send({
                message: error.message,
              });
            }
        
        console.log(updates.audio);
      }
      if(req.files['image']){
        try {
         
                // console.log(url);
            const   b64 = Buffer.from(req.files['image'][0].buffer).toString("base64");
            const    dataURI = "data:" + req.files['image'][0].mimetype + ";base64," + b64;
            const    cldRes = await handleUpload(dataURI);
              // const url =  await cloudinary.url(cldRes.asset_id, {streaming_profile: "auto", resource_type: "audio"})
                console.log(cldRes);
                updates.image = cldRes.secure_url   
            } catch (error) {
              console.log("bbbb")
              console.log(error);
              res.send({
                message: error.message,
              });
            }
        console.log(updates.image);

      }
    
      // Apply updates to the episode
      Object.assign(episode, updates);
  
      // Save the updated episode
      const updatedEpisode = await episode.save();
  
      res.json(updatedEpisode);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error' });
    }
  }
  

export const getById = async (req, res, next) => {
    const id = req.params.id;
    let episode;
    try{
        episode = await Episode.findById(id).select('id episodeNumber title description introduction category audio image duration createdAt notes').populate('category', 'id title').populate('notes', 'note time');
    }catch(err){
        return console.log(err);
    }

    if(!episode){
        return res.status(404).json({message: "Episode not found"});
    }

    
    const createdAt = episode.createdAt.toISOString().split('T')[0];
    const formattedEpisode = { ...episode._doc, createdAt };

  
  // Send the episode data including the image Base64 in the response
  res.status(200).json({episode:formattedEpisode});
};



export const getAudioById = async (req, res, next) => {
    const id = req.params.id;
    let episode;
    try{
        episode = await Episode.findById(id).select('audio');
    }catch(err){
        return console.log(err);
    }

    if(!episode){
        return res.status(404).json({message: "Episode not found"});
    }

        // Set appropriate headers for streaming or chunked response
    res.set({
        'Content-Type': 'audio/mpeg',
        'Transfer-Encoding': 'chunked',
    });

    // Create a readable stream from the audio file
    const readStream = fs.createReadStream(episode.audio);

    // Pipe the stream to the response object
    readStream.pipe(res);

}


export const deleteEpisodeById = async (req, res, next) => {
    const id = req.params.id;
  //TODO: delete notes 
    let episode;
    try {
        episode = await Episode.findByIdAndRemove(id);
    } catch (error) {
        return console.log(error);
    }

    if(!episode){
        return res.status(404).json({message : "unable to delete"});
    }

    return res.status(200).json({message : "succesfelly deleted"});
}

export const getUserEpisodes = async (req, res, next) => {
    const userId = req.params.id;
    let userEpisodes;
    try {
        userEpisodes = await User.findById(userId).populate("episodes");
    } catch (error) {
        return console.log(error);
    }

    if(!userEpisodes){
        return res.status(404).json({episodes:userEpisodes});
    }

    return res.status(200).json({episodes:userEpisodes});
};



  
export const addNote = async (req, res, next) => {
  const {note, time} = req.body;
  const episodeId = req.params.id;
  
  console.log(req.body);
   // Check if audio and image files are present
  if (!note || !time){// Make sure notes is an array) {
  return res.status(400).json({ message: 'note and time are required' });
}
  let existingEpisode;
  try {
          // Validate the categoryId
  if (!mongoose.Types.ObjectId.isValid(episodeId)) {
      return res.status(400).json({ message: 'Invalid episodeId' });
  }

      existingEpisode = await Episode.findById(episodeId);
  } catch (error) {
      return console.log(error)
  }

  if(!existingEpisode){
      return res.status(404).json({message:"episode not found"});
  }

  
 // Loop through the notes array and create note documents
 
   const noteDocument = new Note({
     note,
     time,
   });
   let noteId;
   try {
     // Save the note document
     const savedNote = await noteDocument.save();
     // Push the note ID to the array
     noteId = savedNote._id;
   } catch (error) {
     console.log(error);
     return res.status(500).json({ message: 'Adding notes failed' });
   }
 


 existingEpisode.notes.push(noteId);

  try {
      await existingEpisode.save();

  } catch (error) {
       console.log(error);
       return res.status(500).json({message:"adding note to episode failed"});
  }

  return res.status(200).json({existingEpisode});
}


export const deleteNote = async (req, res, next) => {
  const id = req.params.id;
  const noteId = req.params.noteId;

  let episode;
  let note;
  try {
      episode = await Episode.findById(id);
      
  } catch (error) {
      return console.log(error);
  }

  if(!episode){
      return res.status(404).json({message : "episode not found"});
  }

  try {
    note = await Note.findByIdAndRemove(noteId);
    
} catch (error) {
    return console.log(error);
}

if(!note){
    return res.status(404).json({message : "note not found"});
}

episode.notes.pop(note._id);

  return res.status(200).json({message : "succesfelly deleted"});
}


