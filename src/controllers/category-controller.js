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
    const categoryId = req.params.categoryId;
  
    try {
      const episodes = await Episode.find({
        category: categoryId,
        isPublished: true,
      }).select('id episodeNumber title description image');
  
      res.status(200).json({ episodes });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: 'Server error' });
    }
  };
  