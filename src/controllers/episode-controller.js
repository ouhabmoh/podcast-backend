import Category from "../model/Category.js";
import Episode from "../model/Episode.js";
import User from "../model/User.js";
import { getAudioDurationInSeconds } from 'get-audio-duration';

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
const limit = 10;

export const getAllEpisodes = async (req, res) => {
    let episodes;
    let page = parseInt(req.query.page);
    if (!page || page < 1) { page = 1;}
    try {
      episodes = await Episode.find({ isPublished: true })
        .select('id episodeNumber title category image duration')
        // We multiply the "limit" variables by one just to make sure we pass a number and not a string
        .limit(limit * 1)
        // I don't think i need to explain the math here
        .skip((page - 1) * limit)
        // We sort the data by the date of their creation in descending order (user 1 instead of -1 to get ascending order)
        .sort({ createdAt: -1 })
        .populate('category', 'id title')
        .exec();
    }catch (error) {
        res.status(404).json({message : "Error when getting episodes"});
    }
    if(!episodes){
        res.status(404).json({message : "No Episodes Found"});
    }
    
  return res.status(200).json({ episodes});
};
  

export const addEpisode = async (req, res, next) => {
    const {episodeNumber, title, description, category} = req.body;
    let existingCategory;
    try {
        existingCategory = await Category.findById(category);
    } catch (error) {
        return console.log(error)
    }

    if(!existingCategory){
        return res.status(404).json({message:"category not found"});
    }

    const audio = req.files['audio'][0]['path'];
    console.log(audio);
    // The uploaded image files can be accessed through req.files['image']
    const image = req.files['image'][0]['path'];
    console.log(image);

    // Calculate the duration using getAudioDurationInSeconds
  const durationInSeconds = await getAudioDurationInSeconds(audio);

// Convert duration to minutes and round it up
  const durationInMinutes = Math.ceil(durationInSeconds / 60);

    
    const episode = new Episode({
        episodeNumber, title, description,category, image, audio, duration:durationInMinutes
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
  
    try {
      // Find the episode by ID
      const episode = await Episode.findById(episodeId);
  
      if (!episode) {
        return res.status(404).json({ error: 'Episode not found' });
      }
  
      // Verify and validate the updates
      const allowedUpdates = ['title', 'description', 'isPublished', 'category', 'image', 'audio', 'episodeNumber'];
      const isValidOperation = Object.keys(updates).every((update) => allowedUpdates.includes(update));
  
      if (!isValidOperation) {
        return res.status(400).json({ error: 'Invalid updates' });
      }
  
      // Apply updates to the episode
      Object.assign(episode, updates);
  
      // Save the updated episode
      const updatedEpisode = await episode.save();
  
      res.json(updatedEpisode);
    } catch (error) {
      res.status(500).json({ error: 'Server error' });
    }
  }
  

export const getById = async (req, res, next) => {
    const id = req.params.id;
    let episode;
    try{
        episode = await Episode.findById(id).select('id episodeNumber title description category image duration createdAt').populate('category', 'id title');
    }catch(err){
        return console.log(err);
    }

    if(!episode){
        return res.status(404).json({message: "Episode not found"});
    }

     // Read the image file and convert it to Base64
  let imageBase64;
  try {
    const imageData = fs.readFileSync(episode.image);
    imageBase64 = Buffer.from(imageData).toString('base64');
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: 'Internal server error' });
  }

  // Create a new object to include the image Base64 and other fields
  const episodeData = {
    id: episode._id,
    episodeNumber: episode.episodeNumber,
    title: episode.title,
    description: episode.description,
    category: episode.category,
    image: imageBase64,
    // Add other desired fields
  };

  // Send the episode data including the image Base64 in the response
  res.status(200).json(episodeData);
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
}

export const getCategoryEpisodes = async (req, res) => {
    const categoryId = req.params.categoryId;
    let episodes;
    try {
      episodes = await Episode.find({ category: categoryId, isPublished: true })
        .select('id episodeNumber title description image')
        .exec();
    } catch (error) {
        return console.log(error);
    }
    if(!episodes){
        return res.status(404).json({message: "Episodes not found"});
    }

    return res.status(200).json({episodes});
    
  };
  