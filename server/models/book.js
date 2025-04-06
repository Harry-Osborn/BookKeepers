const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  author: { type: String, required: true },
  genre: { type: String, required: true },
  status: {
    type: String,
    enum: ["Unread", "Reading", "Completed"],
    default: "Unread",
  },
  coverImageUrl: { type: String },
  pdfUrl: { type: String },
  lastReadPage: { type: Number, default: 0 },
  progress: { type: Number, default: 0 },
  totalPages: { type: Number, default: 0 },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true, // ✅ Required so every book is linked to a user
  },
});

module.exports = mongoose.model("Book", bookSchema);
