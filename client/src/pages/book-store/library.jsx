import { useState, useEffect } from "react";
import {
  fetchBooksFromDB,
  updateBookStatus,
  updateBookProgress,
} from "@/services/api";
import { useLocation } from "react-router-dom";

function BookLibrary() {
  const [books, setBooks] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [genreFilter, setGenreFilter] = useState("");
  const [selectedBook, setSelectedBook] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(null);
  const [inputTotalPages, setInputTotalPages] = useState("");
  const [uniqueGenres, setUniqueGenres] = useState([]);
  const location = useLocation();

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

  const handleOpenBook = async (book) => {
    const savedPage = parseInt(
      localStorage.getItem(`book-${book._id}-page`) || "1"
    );
    const savedTotalPages = parseInt(
      localStorage.getItem(`book-${book._id}-totalPages`)
    );

    setCurrentPage(savedPage);
    setTotalPages(savedTotalPages || null);
    setInputTotalPages("");
    setSelectedBook(book);

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
      const iframe = document.querySelector("iframe");
      const iframeDoc =
        iframe?.contentDocument || iframe?.contentWindow?.document;

      if (iframeDoc) {
        const pageInput = iframeDoc.getElementById("pageNumber");
        if (pageInput && pageInput.value) {
          const detectedPage = parseInt(pageInput.value);
          if (!isNaN(detectedPage)) {
            setCurrentPage(detectedPage);
            localStorage.setItem(
              `book-${selectedBook?._id}-page`,
              detectedPage
            );

            if (totalPages && !isNaN(totalPages)) {
              const progress = Math.floor((detectedPage / totalPages) * 100);
              await updateBookProgress(selectedBook._id, {
                lastReadPage: detectedPage,
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
            }
          }
        }
      }
    } catch (err) {
      console.warn("Could not get current page from iframe:", err);
    }

    setSelectedBook(null);
  };

  const handleTotalPagesSubmit = async (e) => {
    e.preventDefault();
    const pages = parseInt(inputTotalPages);
    if (!isNaN(pages) && pages > 0) {
      localStorage.setItem(`book-${selectedBook._id}-totalPages`, pages);
      setTotalPages(pages);

      const progress = Math.floor((currentPage / pages) * 100);

      await updateBookProgress(selectedBook._id, {
        lastReadPage: currentPage,
        totalPages: pages,
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
    } else {
      alert("Please enter a valid number.");
    }
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

      <div className="grid md:grid-cols-4 gap-6 ">
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
          <div className="bg-white rounded-lg w-full max-w-4xl h-[80vh] relative p-4 flex flex-col">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-xl font-semibold">{selectedBook.title}</h3>
              <button
                onClick={handleClosePopup}
                className="text-red-600 text-lg"
              >
                ✕
              </button>
            </div>

            <iframe
              src={`${selectedBook.pdfUrl}#page=${currentPage}`}
              className="flex-1 border rounded mb-2"
              title="Book PDF"
            />

            {!totalPages && (
              <form
                onSubmit={handleTotalPagesSubmit}
                className="mb-2 flex gap-2 items-center"
              >
                <label className="text-sm">Enter total pages:</label>
                <input
                  type="number"
                  value={inputTotalPages}
                  onChange={(e) => setInputTotalPages(e.target.value)}
                  className="border p-1 rounded w-24"
                  min={1}
                  required
                />
                <button
                  type="submit"
                  className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                >
                  Save
                </button>
              </form>
            )}

            {totalPages && (
              <div className="mt-2 flex justify-between items-center">
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    const input = e.target.pageInput.value;
                    const page = parseInt(input);
                    if (!isNaN(page) && page > 0 && page <= totalPages) {
                      setCurrentPage(page);
                      localStorage.setItem(
                        `book-${selectedBook._id}-page`,
                        page
                      );

                      const progress = Math.floor((page / totalPages) * 100);

                      await updateBookProgress(selectedBook._id, {
                        lastReadPage: page,
                        totalPages,
                        progress,
                      });

                      const newStatus =
                        progress === 100 ? "Completed" : "Reading";
                      if (selectedBook.status !== newStatus) {
                        await updateBookStatus(selectedBook._id, newStatus);
                        setBooks((prevBooks) =>
                          prevBooks.map((b) =>
                            b._id === selectedBook._id
                              ? { ...b, status: newStatus }
                              : b
                          )
                        );
                      }
                    } else {
                      alert(
                        `Please enter a valid page between 1 and ${totalPages}`
                      );
                    }
                  }}
                  className="flex items-center gap-2"
                >
                  <input
                    type="number"
                    name="pageInput"
                    min={1}
                    max={totalPages}
                    defaultValue={currentPage}
                    className="p-2 border rounded w-24"
                  />
                  <button
                    type="submit"
                    className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                  >
                    Go
                  </button>
                </form>
                <span className="text-sm text-gray-600">
                  Page {currentPage} of {totalPages}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default BookLibrary;
