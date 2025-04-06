const express = require("express");
const Article = require("../models/Article");
const auth = require("../middleware/Auth");
const router = express.Router();

// Create Article (Admin only)
router.post("/", auth(["admin"]), async (req, res) => {
  try {
    // Validate required fields
    const requiredFields = [
      'title', 'link', 'pubDate', 'creator', 'guid',
      'content', 'post_id', 'post_date', 'post_modified', 'category'
    ];
    
    const missingFields = requiredFields.filter(field => !req.body[field]);
    if (missingFields.length > 0) {
      return res.status(400).json({
        error: `Missing required fields: ${missingFields.join(', ')}`
      });
    }

    // Check for duplicate guid or post_id
    const existingArticle = await Article.findOne({ 
      $or: [{ guid: req.body.guid }, { post_id: req.body.post_id }]
    });
    
    if (existingArticle) {
      return res.status(409).json({
        error: "Article with this guid or post_id already exists"
      });
    }

    const article = new Article({
      title: req.body.title,
      link: req.body.link,
      pubDate: new Date(req.body.pubDate),
      creator: req.body.creator,
      guid: req.body.guid,
      content: req.body.content,
      post_id: req.body.post_id,
      post_date: new Date(req.body.post_date),
      post_modified: new Date(req.body.post_modified),
      post_name: req.body.post_name || "",
      category: req.body.category,
      views: 0
    });

    await article.save();
    res.status(201).json(article);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get All Articles (Public)
router.get("/", async (req, res) => {
  try {
    console.log("Article collection: ", Article.collection.name); // Log the collection name
    const articles = await Article.find().sort({ pubDate: -1 }); // Newest first

    res.json(articles);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get Article by ID (Public)
router.get("/:id", async (req, res) => {
  try {
    const article = await Article.findOne({
      _id: req.params.id,
    });

    if (!article) {
      return res.status(404).json({ error: "Article not found" });
    }

    // Increment views
    article.views += 1;
    await article.save();

    res.json(article);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update Article (Admin only)
// Update Article (Admin only)
router.put("/:id", auth(["admin"]), async (req, res) => {
  try {
    // Only allow certain fields to be updated
    const allowedUpdates = {
      title: req.body.title,
      creator: req.body.creator,
      pubDate: req.body.pubDate ? new Date(req.body.pubDate) : undefined,
      category: req.body.category,
      content: req.body.content,
      post_modified: new Date() // Always update modified date
    };

    // Remove undefined values
    Object.keys(allowedUpdates).forEach(key => 
      allowedUpdates[key] === undefined && delete allowedUpdates[key]
    );

    // Basic validation for required fields
    if (allowedUpdates.title && allowedUpdates.title.trim() === '') {
      return res.status(400).json({ error: "Title cannot be empty" });
    }

    if (allowedUpdates.content && allowedUpdates.content.trim() === '') {
      return res.status(400).json({ error: "Content cannot be empty" });
    }

    const article = await Article.findOneAndUpdate(
      { _id: req.params.id },
      allowedUpdates,
      { 
        new: true, 
        runValidators: true,
        // Only return the fields the frontend needs
        projection: {
          title: 1,
          creator: 1,
          pubDate: 1,
          category: 1,
          content: 1,
          post_modified: 1,
          _id: 1
        }
      }
    );

    if (!article) {
      return res.status(404).json({ error: "Article not found" });
    }

    res.json(article);
  } catch (err) {
    // More specific error handling
    if (err.name === 'ValidationError') {
      return res.status(400).json({ error: err.message });
    }
    if (err.name === 'CastError') {
      return res.status(400).json({ error: "Invalid article ID" });
    }
    res.status(500).json({ error: "Server error while updating article" });
  }
});

// Soft Delete Article (Admin only)
router.delete("/:id", auth(["admin"]), async (req, res) => {
  try {
    const result = await Article.deleteOne({ _id: req.params.id });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "Article not found" });
    }

    res.json({ message: "Article permanently deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


module.exports = router;