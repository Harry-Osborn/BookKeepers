import { useEffect, useRef, useState } from "react";
import {pdfjs } from "react-pdf";
import {
  fetchBooksFromDB,
} from "../../services/api";
import {useLocation, useNavigate } from "react-router-dom";

pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

const BookLibrary = () => {
  const [books, setBooks] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [genreFilter, setGenreFilter] = useState("");
  const [uniqueGenres, setUniqueGenres] = useState([]);
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const location = useLocation();
  const cardRefs = useRef({});
  const navigate = useNavigate();

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
    navigate(`/books/bookDetail/${book._id}`);
  };

  const filteredBooks = books.filter((book) => {
    const matchesSearch =
      book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.author.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = !statusFilter || book.status === statusFilter;
    const matchesGenre = !genreFilter || book.genre === genreFilter;
    const matchesFavorite = !favoritesOnly || book.favourite;
    return matchesSearch && matchesStatus && matchesGenre && matchesFavorite;
  });

  return (
    <div className="min-h-screen px-4 py-8 bg-transparent text-white relative">
      <h1 className="text-3xl font-bold mb-6 text-center">My Book Library</h1>
      <div className="flex flex-col sm:flex-row gap-4 mb-6 justify-center items-center flex-wrap">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search books..."
          className="w-full sm:w-1/4 p-2 rounded bg-gray-800 border border-gray-700"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-full sm:w-1/5 p-2 rounded bg-gray-800 border border-gray-700"
        >
          <option value="">All Status</option>
          <option value="Unread">Unread</option>
          <option value="Reading">Reading</option>
          <option value="Completed">Completed</option>
        </select>
        <select
          value={genreFilter}
          onChange={(e) => setGenreFilter(e.target.value)}
          className="w-full sm:w-1/5 p-2 rounded bg-gray-800 border border-gray-700"
        >
          <option value="">All Genres</option>
          {uniqueGenres.map((genre) => (
            <option key={genre} value={genre}>
              {genre}
            </option>
          ))}
        </select>

        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-300">Favorites</span>
          <button
            onClick={() => setFavoritesOnly(!favoritesOnly)}
            className={`w-12 h-6 flex items-center rounded-full p-1 duration-300 ease-in-out transition-colors ${
              favoritesOnly ? "bg-green-500" : "bg-gray-600"
            }`}
          >
            <div
              className={`bg-white w-4 h-4 rounded-full shadow-md transform duration-300 ease-in-out ${
                favoritesOnly ? "translate-x-6" : "translate-x-0"
              }`}
            ></div>
          </button>
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
        {filteredBooks.map((book) => (
          <div
            key={book._id}
            ref={(el) => (cardRefs.current[book._id] = el)}
            onClick={() => handleOpenBook(book)}
            className="bg-gray-800 rounded-xl overflow-hidden shadow-lg cursor-pointer hover:shadow-xl transition-all"
          >
            <img
              src={book.coverImageUrl}
              alt={book.title}
              className="w-full h-56 object-cover"
            />
            <div className="p-3">
              <h3 className="font-semibold text-lg truncate">{book.title}</h3>
              <p className="text-gray-400 text-sm truncate">{book.author}</p>
              <p className="text-gray-500 text-xs mt-1">
                {book.genre} | {book.status}
              </p>
            </div>
          </div>
        ))}
      </div>
      {filteredBooks.length === 0 && (
        <div className="bg-gray-900/70 border border-gray-800 rounded-2xl p-5 shadow-lg mt-6">
          <p className="text-gray-400 italic text-center">
            No books found matching your criteria.
          </p>
        </div>
      )}
    </div>
  );
};

export default BookLibrary;