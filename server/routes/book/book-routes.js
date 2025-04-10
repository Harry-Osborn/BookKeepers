const express = require("express");
const upload = require("../../helpers/upload");
const { authMiddleware } = require("../../controllers/auth/auth-controller");
const {
  addBook,
  getBooks,
  updateBookStatus,
  updateBook,
  deleteBook,
} = require("../../controllers/book/book-controller");

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
  addBook
);

/**
 * @route   GET /api/books
 * @desc    Fetch all books
 */
router.get("/", authMiddleware, getBooks);

/**
 * @route   PUT /api/books/:id/status
 * @desc    Update only the status of a book
 */
router.put("/:id/status", authMiddleware, updateBookStatus);

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
  updateBook
);

/**
 * @route   DELETE /api/books/:id
 * @desc    Delete a book by ID
 */
router.delete("/:id", authMiddleware, deleteBook);

module.exports = router;
