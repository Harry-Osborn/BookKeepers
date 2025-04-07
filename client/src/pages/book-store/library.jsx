import { useState, useEffect, useRef } from "react";
import {
  fetchBooksFromDB,
  updateBookStatus,
  updateBookProgress,
} from "@/services/api";
import { useLocation } from "react-router-dom";
import { Document, Page, pdfjs } from "react-pdf";

pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

function BookLibrary() {
  const [books, setBooks] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [genreFilter, setGenreFilter] = useState("");
  const [selectedBook, setSelectedBook] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(null);
  const [uniqueGenres, setUniqueGenres] = useState([]);
  const [zoom, setZoom] = useState(1.0);
  const viewerRef = useRef(null);
  const location = useLocation();

  const [pageWidth, setPageWidth] = useState(0);

  useEffect(() => {
    const fetchBooks = async () => {
      const data = await fetchBooksFromDB();
      setBooks(data);
      const genres = [...new Set(data.map((book) => book.genre))];
      setUniqueGenres(genres);
    };
    fetchBooks();
  }, []);

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    if (queryParams.get("filter") === "unread") {
      setStatusFilter("Unread");
    }
  }, [location.search]);

  useEffect(() => {
    const handleResize = () => {
      if (viewerRef.current) {
        setPageWidth(viewerRef.current.offsetWidth);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [selectedBook]);

  const handleOpenBook = async (book) => {
    const savedPage = parseInt(
      localStorage.getItem(`book-${book._id}-page`) || "1"
    );
    setCurrentPage(savedPage);
    setSelectedBook(book);
    setZoom(1.0);

    if (book.status === "Unread") {
      await updateBookStatus(book._id, "Reading");
      setBooks((prevBooks) =>
        prevBooks.map((b) =>
          b._id === book._id ? { ...b, status: "Reading" } : b
        )
      );
    }
  };

  const handleClosePopup = async () => {
    try {
      if (selectedBook && totalPages) {
        const progress = Math.floor((currentPage / totalPages) * 100);
        await updateBookProgress(selectedBook._id, {
          lastReadPage: currentPage,
          totalPages,
          progress,
        });

        const newStatus = progress === 100 ? "Completed" : "Reading";
        if (selectedBook.status !== newStatus) {
          await updateBookStatus(selectedBook._id, newStatus);
          setBooks((prevBooks) =>
            prevBooks.map((b) =>
              b._id === selectedBook._id ? { ...b, status: newStatus } : b
            )
          );
        }

        localStorage.setItem(`book-${selectedBook._id}-page`, currentPage);
      }
    } catch (err) {
      console.warn("Could not update progress:", err);
    }

    setSelectedBook(null);
  };

  const filteredBooks = books.filter((book) => {
    const matchesSearch =
      book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.author.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = !statusFilter || book.status === statusFilter;
    const matchesGenre = !genreFilter || book.genre === genreFilter;
    return matchesSearch && matchesStatus && matchesGenre;
  });

  return (
    <div className="container mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">Book Library</h2>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <input
          type="text"
          placeholder="Search by title or author..."
          className="w-full md:w-1/2 p-2 border rounded"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <div className="flex gap-4">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="p-2 border rounded"
          >
            <option value="">All Status</option>
            <option value="Reading">Reading</option>
            <option value="Unread">Unread</option>
            <option value="Completed">Completed</option>
          </select>

          <select
            value={genreFilter}
            onChange={(e) => setGenreFilter(e.target.value)}
            className="p-2 border rounded"
          >
            <option value="">All Genres</option>
            {uniqueGenres.map((genre) => (
              <option key={genre} value={genre}>
                {genre}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid md:grid-cols-4 gap-6">
        {filteredBooks.map((book) => {
          const savedPage = parseInt(
            localStorage.getItem(`book-${book._id}-page`) || "1"
          );
          const savedTotalPages = parseInt(
            localStorage.getItem(`book-${book._id}-totalPages`) || "300"
          );
          const progress = Math.floor((savedPage / savedTotalPages) * 100 || 0);

          return (
            <div key={book._id} className="p-4 border shadow rounded-lg">
              <img
                src={book.coverImageUrl}
                alt={book.title}
                className="w-full h-40 object-cover rounded mb-2"
              />
              <h3 className="text-lg font-semibold">{book.title}</h3>
              <p className="text-sm text-gray-600">by {book.author}</p>
              <p className="text-sm text-gray-500">Genre: {book.genre}</p>

              <div className="mt-2 bg-gray-200 h-2 rounded-full">
                <div
                  className="bg-blue-500 h-2 rounded-full"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-xs mt-1">{progress}% Completed</p>

              <button
                onClick={() => handleOpenBook(book)}
                className="bg-blue-500 text-white px-4 py-2 mt-3 rounded hover:bg-blue-600"
              >
                Read
              </button>
            </div>
          );
        })}
      </div>

      {selectedBook && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-4xl h-[90vh] relative p-4 flex flex-col">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-xl font-semibold">{selectedBook.title}</h3>
              <button
                onClick={handleClosePopup}
                className="text-red-600 text-lg"
              >
                ✕
              </button>
            </div>

            <div className="flex justify-between items-center mb-2">
              <div className="flex gap-2 items-center">
                <button
                  onClick={() => setZoom((z) => Math.max(0.5, z - 0.1))}
                  className="px-3 py-1 bg-gray-300 rounded"
                >
                  −
                </button>
                <button
                  onClick={() => setZoom((z) => z + 0.1)}
                  className="px-3 py-1 bg-gray-300 rounded"
                >
                  +
                </button>
                <a
                  href={selectedBook.pdfUrl}
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-3 px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                >
                  ⬇
                </a>
              </div>
              <span className="text-sm text-gray-600">
                Page {currentPage} of {totalPages || "?"}
              </span>
            </div>

            <div
              ref={viewerRef}
              className="flex-1 overflow-auto border rounded p-2 bg-gray-50"
            >
              <Document
                file={selectedBook.pdfUrl}
                onLoadSuccess={({ numPages }) => {
                  setTotalPages(numPages);
                  localStorage.setItem(
                    `book-${selectedBook._id}-totalPages`,
                    numPages
                  );
                }}
                loading={<div>Loading PDF...</div>}
              >
                <Page
                  pageNumber={currentPage}
                  width={pageWidth > 0 ? pageWidth * zoom : undefined}
                  renderAnnotationLayer={false}
                  renderTextLayer={false}
                  className="!mb-0"
                />
              </Document>
            </div>

            <div className="mt-3 flex justify-between items-center">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                className="px-3 py-1 bg-gray-300 rounded"
                disabled={currentPage <= 1}
              >
                ←
              </button>
              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(totalPages || 1, prev + 1))
                }
                className="px-3 py-1 bg-gray-300 rounded"
                disabled={currentPage >= totalPages}
              >
                →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default BookLibrary;
