import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { fetchSingleBookFromDB, updateBookStatus,toggleFavoriteInDb } from "@/services/api";

function BookDetails() {
  const { bookId } = useParams();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const getBook = async () => {
      try {
        const book = await fetchSingleBookFromDB(bookId);
        setBook(book);
        setIsFavorite(book.favourite);
      } catch (err) {
        console.error("Failed to fetch book details", err);
      } finally {
        setLoading(false);
      }
    };

    getBook();
  }, [bookId]);

  const handleRead = async () => {
    if (book.status === "Unread") {
      await updateBookStatus(book._id, "Reading");
      setBook((prev) => ({ ...prev, status: "Reading" }));
    }
    if(book.status==="Completed")
    {
      await updateBookStatus(book._id, "Reading");
      setBook((prev) => ({ ...prev, status: "Reading" }));
    }
    navigate(`/books/reader/${book._id}`);
  };

  
  const toggleFavorite = async () => {
    try {
      const status = isFavorite;
      const msg = await toggleFavoriteInDb(book._id, !status);
      if (msg === `Book marked as ${!status ? "favourite" : "not favourite"}.`) {
        setIsFavorite(!status);
        console.log(msg);
      }
    } catch (err) {
      console.error("❌ Failed to toggle the book as favourite:", err);
    }
  };
  

  if (loading) return <div className="text-white text-center p-10">Loading...</div>;
  if (!book) return <div className="text-white text-center p-10">Book not found</div>;

  return (
  <div className="min-h-screen bg-transparent text-white">
  <h1 className="text-5xl font-playfair font-bold border-b pb-2 p-10 px-20 border-gray-700">
    {book.title}
  </h1>

  <div className="flex flex-col px-6 py-10 lg:flex-row gap-8 justify-center items-center">
    <img
      src={book.coverImageUrl}
      alt={book.title}
      className="w-full max-w-md rounded-xl shadow-xl border border-gray-700 object-cover"
    />

    <div className="max-w-2xl w-full space-y-4 font-inter">
      <p className="text-gray-400">
        By <span className="text-white font-semibold">{book.author}</span>
      </p>
      <p className="text-sm text-gray-400">Genre: {book.genre}</p>
      <p className="text-sm text-gray-400">Status: {book.status}</p>

      {/* Buttons */}
      <div className="flex flex-wrap gap-4 mt-6">
        <div
          onClick={handleRead}
          className="flex-shrink-0 flex px-6 items-center justify-center text-sm font-medium rounded-lg transition bg-white hover:bg-black text-black hover:text-white cursor-pointer"
        >
          {book.status === "Reading" ? "Continue Reading" : "Start Reading"}
          <span
            className="text-2xl p-2 group w-fit grid"
            style={{ clipPath: "inset(0 0 0 0)" }}
          >
            <span className="[grid-area:1/1] flex items-center justify-center h-10 w-10 transition ease-in-out group-hover:delay-300 -translate-x-10 group-hover:translate-x-0">
              ➝
            </span>
            <span className="[grid-area:1/1] flex items-center justify-center h-10 w-10 transition ease-in-out delay-300 group-hover:delay-[0s] duration-300 group-hover:translate-x-10">
              ➝
            </span>
          </span>
        </div>

        <button
          onClick={toggleFavorite}
          className={`px-5 py-2 rounded shadow border transition ${
            isFavorite
              ? "bg-yellow-500 border-yellow-400 text-black"
              : "bg-gray-700 border-gray-600 text-white hover:bg-gray-600"
          }`}
        >
          {isFavorite ? "★ Favorited" : "☆ Add to Favorites"}
        </button>
      </div>

      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-2 font-playfair">Description</h3>
        <p className="text-sm text-gray-300">
          {book.description || "No description available."}
        </p>
      </div>
    </div>
  </div>
</div>

  );
}

export default BookDetails;
