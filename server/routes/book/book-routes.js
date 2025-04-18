const express = require("express");
const upload = require("../../helpers/upload"); // Multer middleware
const { authMiddleware } = require("../../controllers/auth/auth-controller");
const {
  addBook,
  getBooks,
  updateBookStatus,
  updateBookDetails,
  deleteBook,
  toggleFavourite,
  getBook,
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
  updateBookDetails
);

/**
 * @route   DELETE /api/books/:id
 * @desc    Delete a book by ID
 */
router.delete("/:id", authMiddleware, deleteBook);

/**
 * @route   POST /favourite/:bookId
 * @desc    Toggles the book as favourited or not
 */
router.post("/favourite/:bookId", authMiddleware, toggleFavourite);

/**
 * @route   GET /getBook/:bookId
 * @desc    Returns the book
 */
router.get("/getBook/:bookId", authMiddleware, getBook);

module.exports = router;
