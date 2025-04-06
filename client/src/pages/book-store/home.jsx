import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchBooksFromDB } from "@/services/api";

function BookpageHome() {
  const [booksdata, setBooksdata] = useState([]);

  useEffect(() => {
    const getBooks = async () => {
      try {
        const userId = localStorage.getItem("userId");
        if (!userId) {
          console.warn("❌ User ID not found in localStorage");
          return;
        }

        const userBooks = await fetchBooksFromDB(userId);
        console.log("✅ Books fetched for user:", userBooks);
        setBooksdata(userBooks);
      } catch (error) {
        console.error("❌ Failed to fetch books:", error);
      }
    };

    getBooks();
  }, []);

  // 📚 Books with status "Reading", sorted by progress, top 3
  const continueReading = booksdata
    .filter((book) => book.status === "Reading")
    .sort((a, b) => b.progress - a.progress)
    .slice(0, 3);

  // 📖 Books with status "Unread"
  const unreadbooksdata = booksdata.filter((book) => book.status === "Unread");

  return (
    <div className="container mx-auto p-6">
      {/* 📌 Continue Reading Section */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Continue Reading</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {continueReading.map((book) => (
            <div key={book._id} className="p-4 border shadow-lg rounded-lg">
              {book.coverImageUrl && (
                <img
                  src={book.coverImageUrl}
                  alt={book.title}
                  className="w-full h-48 object-cover rounded mb-3"
                />
              )}
              <h3 className="text-lg font-semibold">{book.title}</h3>
              <p className="text-sm text-gray-500">by {book.author}</p>
              <div className="mt-2 bg-gray-200 h-2 rounded-full">
                <div
                  className="bg-blue-500 h-2 rounded-full"
                  style={{ width: `${book.progress}%` }}
                ></div>
              </div>
              <p className="text-sm mt-2">{book.progress}% Completed</p>
            </div>
          ))}
        </div>
      </section>

      {/* 📚 Books to Be Read Section */}
      <section className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Books to Be Read</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {unreadbooksdata.slice(0, 3).map((book) => (
            <div key={book._id} className="p-4 border shadow-lg rounded-lg">
              {book.coverImageUrl && (
                <img
                  src={book.coverImageUrl}
                  alt={book.title}
                  className="w-full h-48 object-cover rounded mb-3"
                />
              )}
              <h3 className="text-lg font-semibold">{book.title}</h3>
              <p className="text-sm text-gray-500">by {book.author}</p>
            </div>
          ))}
        </div>

        <div className="mt-4">
          <Link to="/books/library?filter=unread">
            <button className="px-4 py-2 bg-blue-500 text-white rounded">
              Show Unread Books
            </button>
          </Link>
        </div>
      </section>
    </div>
  );
}

export default BookpageHome;
