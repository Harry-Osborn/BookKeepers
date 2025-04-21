import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { fetchBooksFromDB } from "@/services/api";
import BookReaderModal from "@/components/common/book-reader-comp";

function ReaderLayout() {
  const { bookId } = useParams();
  const [book, setBook] = useState(null);
  const [books, setBooks] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const getBook = async () => {
      const allBooks = await fetchBooksFromDB();
      const foundBook = allBooks.find((b) => b._id === bookId);
      if (foundBook) {
        const savedPage = parseInt(
          localStorage.getItem(`book-${bookId}-page`) || "1"
        );
        setBook({ ...foundBook, savedPage });
        setBooks(allBooks);
      } else {
        navigate("/books/library");
      }
    };
    getBook();
  }, [bookId, navigate]);

  if (!book) return <div className="text-white p-6">Loading...</div>;

  return (
    <div className="bg-black min-h-screen flex items-center justify-center">
      <BookReaderModal
        book={book}
        setBooks={setBooks}
        onClose={() => {
          navigate("/books/library");
        }}
      />
    </div>
  );
}

export default ReaderLayout;
