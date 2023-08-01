import Article from "../model/Article.js";
import Category from "../model/Category.js";
import mongoose from "mongoose";

export const getAllArticles = async (req, res, next) => {
  const { isPublished, search, readTime, startDate, endDate } = req.query;
  let page = parseInt(req.query.page);
  let limit = parseInt(req.query.limit);
  
  if (!page || page < 1) { page = 1; }
  if (!limit || limit < 1) { limit = 6; }
  
  const filter = {};
  if (isPublished) {
    filter.isPublished = isPublished === '1';
  }
//   if (readTime) {
//     const { minTime, maxTime } = readTimeCategory(parseInt(readTime));
//     filter.readTime = { $gte: minTime, $lte: maxTime };
//   }
  if (startDate && endDate) {
    filter.createdAt = { $gte: new Date(startDate), $lte: new Date(endDate) };
  } else if (startDate) {
    filter.createdAt = { $gte: new Date(startDate) };
  } else if (endDate) {
    filter.createdAt = { $lte: new Date(endDate) };
  }
  if (search) {
    const searchRegex = new RegExp(search, 'i');
    filter.$or = [{ title: searchRegex }];
  }

  try {
    const articles = await Article.find(filter)
      .select("id title image readTime isPublished category createdAt")
      .limit(limit)
      .skip((page - 1) * limit)
      .populate('category', 'id title')
      .sort({ createdAt: -1 });

    const count = await Article.countDocuments(filter);

    const totalPages = Math.ceil(count / limit);
    
    const formattedArticles = articles.map((article) => {
      const createdAt = article.createdAt.toISOString().split('T')[0];
      return { ...article._doc, createdAt };
    });

    res.status(200).json({ totalPages, articles: formattedArticles });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
};

const readTimeCategory = (readTimeCategoryNumber) => {
  let minDuration, maxDuration;

  switch (readTimeCategoryNumber) {
    case 0:
      minDuration = "00:00:00";
      maxDuration = "00:14:59";
      break;
    case 1:
      minDuration = "00:15:00";
      maxDuration = "00:29:59";
      break;
    case 2:
      minDuration = "00:30:00";
      maxDuration = "00:59:59";
      break;
    case 3:
      minDuration = "01:00:00";
      maxDuration = "23:59:59";
      break;
    default:
      // For any other number, assume less than 15 minutes
      minDuration = "00:00:00";
      maxDuration = "00:14:59";
      break;
  }

  return { minDuration, maxDuration };
};



// Add a new article
export const addArticle = async (req, res, next) => {
    const { title, content, image, readTime, category } = req.body;
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
   
    const article = new Article({
      title,
      content,
      image,
      readTime,
      category,
    });
  
    try {
      const newArticle = await article.save();
      res.status(201).json({ article: newArticle });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Server error" });
    }
  };

  
  export const toggleIsPublished = async (req, res, next) => {
    const _id = req.params.id;
    let article;
    try{
        article = await Article.findOneAndUpdate({_id}, [{$set:{isPublished:{$eq:[false,"$isPublished"]}}}]);

    }catch(err){
        console.log(err);
        return  res.status(500).json({ message: "Server error" });
    }

    if(!episode){
        return res.status(404).json({message: "Article not found"});
    }

    
  
  res.status(200).json({'success': true});
};

export const updateArticle = async (req, res, next) => {
    const _id = req.params.id;
    const update = {};
    for (const key of Object.keys(req.body)){
    if (req.body[key] !== '') {
        update[key] = req.body[key];
    }
    }
    
    
      Article.findOneAndUpdate({_id}, {$set: update}, {new: true}).then((article) => {
        console.log("success");
        res.status(201).json({message:'updated with success' });
  }).catch(err => {
       console.log("err", err);
       res.status(500).send(err);
  })
  
  
  };

  // Get article by ID
export const getById = async (req, res, next) => {
    const { id } = req.params;
    try {
      const article = await Article.findById(id).select("id title content image readTime isPublished category createdAt")
                                                .populate('category', 'id title');
      if (!article) {
        return res.status(404).json({ message: "Article not found" });
      }
      res.status(200).json({ article });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Server error" });
    }
  };
  
  // Delete article by ID
  export const deleteArticleById = async (req, res, next) => {
    const { id } = req.params;
    try {
      const article = await Article.findByIdAndDelete(id);
      if (!article) {
        return res.status(404).json({ message: "Article not found" });
      }
      res.status(200).json({ message: "Delete successful" });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Server error" });
    }
  };