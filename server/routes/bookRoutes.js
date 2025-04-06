const express = require("express");
const Book = require("../models/Book");
const upload = require("../helpers/upload"); // Multer middleware
const uploadFileToS3 = require("../helpers/uploadtos3"); // AWS S3 upload helper
const { authMiddleware } = require("../controllers/auth/auth-controller");

const router = express.Router();

/**
 * @route   POST /api/books/add
 * @desc    Add a new book with Image & PDF Upload
 */
router.post(
  "/add",
  authMiddleware,
  upload.fields([
    { name: "coverImage", maxCount: 1 },
    { name: "pdf", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const { title, author, genre, status, totalPages } = req.body;

      if (!title || !author || !genre) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      const validStatuses = ["Unread", "Reading", "Completed"];
      const bookStatus = validStatuses.includes(status) ? status : "Unread";

      if (!req.files || (!req.files.coverImage && !req.files.pdf)) {
        return res.status(400).json({ message: "File upload failed" });
      }

      const coverImageFile = req.files.coverImage?.[0] || null;
      const pdfFile = req.files.pdf?.[0] || null;

      const coverImageUrl = coverImageFile
        ? await uploadFileToS3(coverImageFile, "covers")
        : null;

      const pdfUrl = pdfFile ? await uploadFileToS3(pdfFile, "pdfs") : null;

      const newBook = new Book({
        title,
        author,
        genre,
        status: bookStatus,
        coverImageUrl,
        pdfUrl,
        totalPages: totalPages ? parseInt(totalPages) : 0,
        userId: req.user.id, // ✅ Associate book with the user
      });

      await newBook.save();

      return res.status(201).json({
        message: "Book added successfully",
        book: newBook,
      });
    } catch (error) {
      console.error("❌ Error adding book:", error);
      return res.status(500).json({
        message: "Internal Server Error",
        error: error.message,
      });
    }
  }
);

/**
 * @route   GET /api/books
 * @desc    Fetch all books
 */
router.get("/", authMiddleware, async (req, res) => {
  try {
    const books = await Book.find({ userId: req.user.id });
    return res.status(200).json(books);
  } catch (error) {
    console.error("❌ Error fetching books:", error.message);
    return res.status(500).json({
      message: "Error fetching books",
      error: error.message,
    });
  }
});

/**
 * @route   PUT /api/books/:id/status
 * @desc    Update only the status of a book
 */
router.put("/:id/status", authMiddleware, async (req, res) => {
  try {
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ message: "Status is required" });
    }

    const book = await Book.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { status },
      { new: true }
    );

    if (!book) {
      return res
        .status(404)
        .json({ message: "Book not found or unauthorized" });
    }

    return res.status(200).json({ message: "Status updated", book });
  } catch (error) {
    console.error("❌ Error updating status:", error.message);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
});

/**
 * @route   PUT /api/books/:id
 * @desc    Update book details with optional file uploads
 */
router.put(
  "/:id",
  authMiddleware,
  upload.fields([
    { name: "coverImage", maxCount: 1 },
    { name: "pdf", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const book = await Book.findOne({
        _id: req.params.id,
        userId: req.user.id,
      });

      if (!book) {
        return res
          .status(404)
          .json({ message: "Book not found or unauthorized" });
      }

      const {
        title,
        author,
        genre,
        status,
        lastReadPage,
        progress,
        totalPages,
        existingCoverImageUrl,
        existingPdfUrl,
      } = req.body;

      if (title) book.title = title;
      if (author) book.author = author;
      if (genre) book.genre = genre;
      if (status) book.status = status;

      if (!isNaN(parseInt(lastReadPage))) {
        book.lastReadPage = parseInt(lastReadPage);
      }
      if (!isNaN(parseInt(progress))) {
        book.progress = parseInt(progress);
      }
      if (!isNaN(parseInt(totalPages))) {
        book.totalPages = parseInt(totalPages);
      }

      // ✅ Retain existing image/pdf if no new file uploaded
      if (existingCoverImageUrl && !req.files?.coverImage) {
        book.coverImageUrl = existingCoverImageUrl;
      }

      if (existingPdfUrl && !req.files?.pdf) {
        book.pdfUrl = existingPdfUrl;
      }

      // ✅ Upload new files if provided
      if (req.files?.coverImage) {
        const coverImageFile = req.files.coverImage[0];
        book.coverImageUrl = await uploadFileToS3(coverImageFile, "covers");
      }

      if (req.files?.pdf) {
        const pdfFile = req.files.pdf[0];
        book.pdfUrl = await uploadFileToS3(pdfFile, "pdfs");
      }

      if (book.progress === 100 && book.status !== "Completed") {
        book.status = "Completed";
      }

      await book.save();

      return res.status(200).json({
        message: "Book updated successfully",
        book,
      });
    } catch (error) {
      console.error("❌ Update Error:", error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }
);

/**
 * @route   DELETE /api/books/:id
 * @desc    Delete a book by ID
 */
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const book = await Book.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!book) {
      return res
        .status(404)
        .json({ message: "Book not found or unauthorized" });
    }

    return res.status(200).json({ message: "Book deleted successfully" });
  } catch (error) {
    console.error("❌ Error deleting book:", error.message);
    return res.status(500).json({
      message: "Error deleting book",
      error: error.message,
    });
  }
});

module.exports = router;
