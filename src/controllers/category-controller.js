import Category from "../model/Category.js";
import Episode from "../model/Episode.js";
import User from "../model/User.js";
import Note from "../model/Note.js";
import { getAudioDurationInSeconds } from 'get-audio-duration';
import mongoose from "mongoose";

export const getAllCategories = async (req, res, next) => {
    try {
      const categories = await Category.find();
      res.status(200).json({ categories });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: 'Server error' });
    }
  };
  export const addCategory = async (req, res, next) => {
    const { title } = req.body;
    if (!title) {
      return res.status(400).json({ message: 'Title is required' });
    }
  
    const category = new Category({ title });
  
    try {
      await category.save();
      res.status(201).json({ category });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: 'Server error' });
    }
  };

  
  export const updateCategory = async (req, res, next) => {
    const id = req.params.id;
    const { title } = req.body;
  
    try {
      const category = await Category.findByIdAndUpdate(
        id,
        { title },
        { new: true }
      );
  
      if (!category) {
        return res.status(404).json({ message: 'Category not found' });
      }
  
      res.status(200).json({ category });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: 'Server error' });
    }
  };

  
  export const getById = async (req, res, next) => {
    const id = req.params.id;
  
    try {
      const category = await Category.findById(id);
      if (!category) {
        return res.status(404).json({ message: 'Category not found' });
      }
  
      res.status(200).json({ category });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: 'Server error' });
    }
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