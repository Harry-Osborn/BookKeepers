import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchBooksFromDB } from "@/services/api";
import BookReaderModal from "@/components/common/book-reader-comp";
function BookpageHome() {
  const [booksdata, setBooksdata] = useState([]);
  const [selectedBook, setSelectedBook] = useState(null);

  const handleRead = (book) => {
    setSelectedBook(book);
  };

  const getBooks = async () => {
    try {
      const userId = localStorage.getItem("userId");
      if (!userId) return;
      const userBooks = await fetchBooksFromDB(userId);
      setBooksdata(userBooks);
    } catch (error) {
      console.error("Failed to fetch books:", error);
    }
  };
  // const percentage = Math.min(Math.max(progress, 0), 100);
  const getpercentage = (progess) => {
    return Math.min(Math.max(progess, 0), 100);
  };

  useEffect(() => {
    getBooks();
  }, []);

  const continueReading = booksdata
    .filter((book) => book.status === "Reading")
    .sort((a, b) => b.progress - a.progress);

  const unreadBooks = booksdata.filter((book) => book.status === "Unread");

  const BookSlider = ({ books, section }) => (
    <div className="relative">
      <div
        className="flex gap-6 overflow-x-scroll pb-2 scroll-smooth snap-x snap-mandatory whitespace-nowrap no-scrollbar"
        style={{ WebkitOverflowScrolling: "touch", scrollbarWidth: "none" }}
      >
        <style>{`
          .no-scrollbar::-webkit-scrollbar {
            display: none;
          }
        `}</style>

        {books.slice(0, 8).map((book) => (
          <div
            key={book._id}
            className="group w-[200px] h-[300px] flex-shrink-0 snap-start relative"
          >
            <div className="relative">
              <img
                src={book.coverImageUrl}
                alt={book.title}
                className="w-full h-64 object-cover shadow-lg border border-gray-700 transition-all group-hover:h-64 group-hover:scale-y-125 group-hover:scale-x-125 group-hover:shadow-xl"
              />
              <div className="w-full h-1 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-200 transition-all duration-500"
                  style={{ width: `${book.progress}%` }}
                ></div>
              </div>
              {/* {section === "reading" ? "Continue" : "Start"} */}
              <div className="absolute inset-0 group-hover:my-0  opacity-0 group-hover:opacity-100  flex flex-col justify-end group-hover:h-75 group-hover:scale-125 group-hover:shadow-xl">
                <button
                  onClick={() => handleRead(book)}
                  className="absolute bottom-0 left-0 py-2 w-full text-sm hover:text-white hover:bg-slate-900 bg-white text-gray-900 "
                >
                  {section === "reading" ? "Continue" : "Start"}
                </button>
                {/* </div> */}
              </div>
            </div>
          </div>
        ))}

        {books.length > 8 && (
          <Link
            to="/books/library"
            className="w-[200px] flex-shrink-0 flex items-center justify-center snap-start"
          >
            <div
              className="text-2xl p-2 group w-fit grid"
              style={{ clipPath: "inset(0 0 0 0)" }}
            >
              <div className="[grid-area:1/1] flex items-center justify-center h-10 w-10 transition ease-in-out group-hover:delay-300 -translate-x-10 group-hover:translate-x-0">
                ➝
              </div>
              <div className="[grid-area:1/1] flex items-center justify-center h-10 w-10 transition ease-in-out delay-300 group-hover:delay-[0s] duration-300 group-hover:translate-x-10">
                ➝
              </div>
            </div>
          </Link>
        )}
      </div>
    </div>
  );

  return (
    <>
      <div className="relative z-10 px-4 py-10 sm:px-6 lg:px-10 text-white">
        <div className="text-center mb-12">
          <h1 className="font-playfair italic text-4xl text-white ">
            Where Every Book Finds Its Chapter.
          </h1>
          {/* <p className="text-gray-300 mt-4 text-sm font-diphylleia">
            Track, Read, and Conquer your Bookshelf
          </p> */}
        </div>

        {/* Continue Reading */}
        <div className="p-2 shadow-lg mb-10">
          <h2 className="text-2xl font-semibold text-white mb-4">
            Continue Reading
          </h2>
          {continueReading.length === 0 ? (
            <p className="text-gray-400 italic text-center">
              You haven’t started any books yet.
            </p>
          ) : (
            <BookSlider books={continueReading} section="reading" />
          )}
        </div>

        {/* Unread Books */}
        <div className="p-2 shadow-lg mb-10">
          <h2 className="text-2xl font-semibold text-white mb-4">
            Books to Be Read
          </h2>
          {unreadBooks.length === 0 ? (
            <p className="text-gray-400 italic text-center">
              You’ve read all your books. Great job!
            </p>
          ) : (
            <BookSlider books={unreadBooks} section="unread" />
          )}
        </div>

        {selectedBook && (
          <div className="my-24">
            <BookReaderModal
              book={selectedBook}
              onClose={() => {
                setSelectedBook(null);
                getBooks();
              }}
            />
          </div>
        )}
      </div>
    </>
  );
}

export default BookpageHome;
