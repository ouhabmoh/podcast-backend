import Category from "../model/Category.js";
import Episode from "../model/Episode.js";
import User from "../model/User.js";
import Note from "../model/Note.js";
import { getAudioDurationInSeconds } from 'get-audio-duration';
import mongoose from "mongoose";

export const getAllCategories = async (req, res, next) => {
  let categories;
    try {
      categories = await Category.find().select("id title description image createdAt");
      
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: 'Server error' });
    }
    if(!categories){
     return res.status(404).json({message : "No Categories Found"});
    }

    const formattedCategories = categories.map((categorie) => {
      const createdAt = categorie.createdAt.toISOString().split('T')[0];
      return { ...categorie._doc, createdAt };
    });
    res.status(200).json({ categories : formattedCategories });
  };
  export const addCategory = async (req, res, next) => {
    const { title, description, image } = req.body;
    
  
    const category = new Category({ title, description, image });
  
    try {
      await category.save();
      
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: 'Server error' });
    }

    res.status(201).json({ category });
  };

  
  export const updateCategory = async (req, res, next) => {
    const _id = req.params.id;
    const update = {};
    for (const key of Object.keys(req.body)){
    if (req.body[key] !== '') {
        update[key] = req.body[key];
    }
    }
    
    
      Category.findOneAndUpdate({_id}, {$set: update}, {new: true}).then((category) => {
        console.log("success");
        res.status(201).json({message:'updated with success' });
  }).catch(err => {
       console.log("err", err);
       res.status(500).send(err);
  })
  
  
  };

  
  export const getById = async (req, res, next) => {
    const _id = req.params.id;
    let category;
    try {
      category = await Category.findById(_id);
      if (!category) {
        return res.status(404).json({ message: 'Category not found' });
      }
  
  
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: 'Server error' });
    }

    let episodes;
    console.log(req.query);
     const {isPublished, search, duration, startDate, endDate } = req.query;

    let page = parseInt(req.query.page);
    let limit = parseInt(req.query.limit);
    if (!page || page < 1) { page = 1;}
    if(!limit || limit < 1){ limit = 6;}
    console.log(page, limit);
    let count;
   
      // Prepare the filter object based on query parameters
  const filter = {};

  filter.category = _id;
  
  if (isPublished) {
    filter.isPublished = isPublished === '1'; // Convert string to boolean
  }
  
  if (duration) {
    const {minDuration, maxDuration} = durationCategory(parseInt(duration));
    console.log(minDuration, maxDuration);
    filter.duration = { $gte : minDuration, $lte: maxDuration };
  }
  if (startDate && endDate) {
    filter.createdAt = { $gte: new Date(startDate), $lte: new Date(endDate) };
  } else if(startDate){
    filter.createdAt = { $gte: new Date(startDate)};
  } else if(endDate){
    filter.createdAt = { $lte: new Date(endDate)};
  }

  // Check if the search parameter is provided
if (search) {
  // Create the regex pattern for case-insensitive search
  const searchRegex = new RegExp(search, 'i');

  // Add the $or operator to search for the title or description
  filter.$or = [{ title: searchRegex }, { description: searchRegex }];
}

console.log(filter);
try {
      episodes = await Episode.find(filter).select('id episodeNumber title image duration createdAt isPublished')
        // We multiply the "limit" variables by one just to make sure we pass a number and not a string
        .limit(limit * 1)
        // I don't think i need to explain the math here
        .skip((page - 1) * limit)
        // We sort the data by the date of their creation in descending order (user 1 instead of -1 to get ascending order)
        .sort({ createdAt: -1 })
     
        .exec();
        // Getting the numbers of products stored in database
        count = await Episode.countDocuments();
    }catch (error) {
       return  res.status(404).json({message : "Error when getting episodes"});
    }
    // if(!episodes){
    //     res.status(404).json({message : "No Episodes Found"});
    // }
    const formattedEpisodes = episodes.map((episode) => {
        const createdAt = episode.createdAt.toISOString().split('T')[0];
        return { ...episode._doc, createdAt };
      });
    console.log(formattedEpisodes);
  return res.status(200).json({ category, episodes : {totalPages: Math.ceil(count / limit), list:formattedEpisodes}});
  };

  
  export const deleteCategoryById = async (req, res, next) => {
    const id = req.params.id;
  
    try {
      const category = await Category.findByIdAndRemove(id);
      if (!category) {
        return res.status(404).json({ message: 'Category not found' });
      }
  
      res.status(200).json({ message: 'Category deleted successfully' });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: 'Server error' });
    }
  };

  export const getCategoryEpisodes = async (req, res) => {
    const categoryId = req.params.id;
    console.log(categoryId);
    // Check if categoryId is a valid ObjectId
  if (!mongoose.Types.ObjectId.isValid(categoryId)) {
    return res.status(400).json({ message: 'Invalid category ID' });
  }

  let episodes;
  let page = parseInt(req.query.page);
  let limit = parseInt(req.query.limit);
  if (!page || page < 1) { page = 1;}
  if(!limit || limit < 1){ limit = 6;}
  let count;
  try {
    episodes = await Episode.find({category: categoryId,  isPublished: true })
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
  
return res.status(200).json({ totalPages: Math.ceil(count / limit), episodes : formattedEpisodes});};