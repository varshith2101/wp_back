const mongoose = require("mongoose");

const ArticleSchema = new mongoose.Schema({
  title: { type: String, required: true },
  link: { type: String, required: true },
  pubDate: { type: Date, required: true },
  creator: { type: String, required: true },
  guid: { type: String, required: true, unique: true },
  content: { type: String, required: true },
  post_id: { type: String, required: true, unique: true },
  post_date: { type: Date, required: true },
  post_modified: { type: Date, required: true },
  post_name: { type: String },
  category: { type: String, required: true }
}, { strict: false });

module.exports = mongoose.model("Article", ArticleSchema, "Articles_of_TheMitPost");
