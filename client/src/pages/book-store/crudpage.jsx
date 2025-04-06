import api from "../../services/api";
import { useState, useEffect } from "react";
import { useDropzone } from "react-dropzone";

function AddBookPage() {
  const [books, setBooks] = useState([]);
  const [book, setBook] = useState({
    title: "",
    author: "",
    genre: "",
    status: "Unread",
  });
  const [coverImage, setCoverImage] = useState(null);
  const [pdf, setPdf] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [genreFilter, setGenreFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBook, setEditingBook] = useState(null);

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      const userId = localStorage.getItem("userId"); // ✅ Get userId
      if (!userId) {
        console.error("No userId found in localStorage");
        return;
      }

      const response = await api.get(`/books?userId=${userId}`); // ✅ Send userId as query

      console.log("Fetched books data:", response.data);

      if (Array.isArray(response.data)) {
        setBooks(response.data);
      } else if (Array.isArray(response.data.books)) {
        setBooks(response.data.books);
      } else {
        console.error("Books API did not return an array:", response.data);
      }
    } catch (error) {
      console.error("Error fetching books:", error);
    }
  };

  const onDropImage = (acceptedFiles) => setCoverImage(acceptedFiles[0]);
  const onDropPdf = (acceptedFiles) => setPdf(acceptedFiles[0]);

  const { getRootProps: getImageRootProps, getInputProps: getImageInputProps } =
    useDropzone({ accept: { "image/*": [] }, onDrop: onDropImage });

  const { getRootProps: getPdfRootProps, getInputProps: getPdfInputProps } =
    useDropzone({ accept: { "application/pdf": [] }, onDrop: onDropPdf });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!book.title || !book.author || !book.genre) {
      alert("Please fill in all the required fields: Title, Author, Genre");
      return;
    }

    const userId = localStorage.getItem("userId"); // Or wherever you're storing the userId

    if (!userId) {
      alert("User not authenticated");
      return;
    }

    const formData = new FormData();
    formData.append("title", book.title);
    formData.append("author", book.author);
    formData.append("genre", book.genre);
    formData.append("status", book.status);
    formData.append("userId", userId); // ✅ Important

    if (coverImage) {
      formData.append("coverImage", coverImage);
    } else if (editingBook?.coverImageUrl) {
      formData.append("existingCoverImageUrl", editingBook.coverImageUrl);
    }

    if (pdf) {
      formData.append("pdf", pdf);
    } else if (editingBook?.pdfUrl) {
      formData.append("existingPdfUrl", editingBook.pdfUrl);
    }

    const url = editingBook ? `/books/${editingBook._id}` : "/books/add";
    const method = editingBook ? "put" : "post";

    try {
      const res = await api({
        method,
        url,
        data: formData,
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.status === 200 || res.status === 201) {
        alert(editingBook ? "Book updated!" : "Book added!");
        resetForm();
        fetchBooks();
      } else {
        alert("Failed to save book");
      }
    } catch (error) {
      console.error("Error saving book:", error);
      alert("An error occurred while saving the book");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this book?")) {
      try {
        const res = await api.delete(`/books/${id}`);
        if (res.status === 200) {
          alert("Deleted!");
          fetchBooks();
        }
      } catch (error) {
        console.error("Error deleting book:", error);
      }
    }
  };

  const resetForm = () => {
    setBook({ title: "", author: "", genre: "", status: "Unread" });
    setCoverImage(null);
    setPdf(null);
    setEditingBook(null);
    setIsModalOpen(false);
  };

  const openEditModal = (book) => {
    setEditingBook(book);
    setBook({
      title: book.title,
      author: book.author,
      genre: book.genre,
      status: book.status || "Unread",
    });
    setCoverImage(null);
    setPdf(null);
    setIsModalOpen(true);
  };

  const filteredBooks = books
    .filter(
      (b) =>
        b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.author.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .filter((b) => genreFilter === "All" || b.genre === genreFilter)
    .filter((b) => statusFilter === "All" || b.status === statusFilter);

  const uniqueGenres = [...new Set(books.map((b) => b.genre))];
  const statuses = ["Read", "Unread", "In Progress"];

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">Book Library</h2>

      {/* Search and Filters */}
      <div className="flex flex-wrap items-center gap-4 mb-4">
        <input
          type="text"
          placeholder="Search..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="px-3 py-2 border rounded"
        />

        <select
          value={genreFilter}
          onChange={(e) => setGenreFilter(e.target.value)}
          className="px-3 py-2 border rounded"
        >
          <option value="All">All Genres</option>
          {uniqueGenres.map((g, i) => (
            <option key={i} value={g}>
              {g}
            </option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border rounded"
        >
          <option value="All">All Status</option>
          {statuses.map((s, i) => (
            <option key={i} value={s}>
              {s}
            </option>
          ))}
        </select>

        <button
          onClick={() => {
            resetForm();
            setIsModalOpen(true);
          }}
          className="ml-auto bg-blue-600 text-white px-4 py-2 rounded"
        >
          + Add Book
        </button>
      </div>

      {/* Books Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {filteredBooks.map((book) => (
          <div key={book._id} className="bg-white p-4 shadow rounded-lg">
            <img
              src={book.coverImageUrl}
              alt={book.title}
              className="w-full h-40 object-cover mb-2 rounded"
            />
            <h3 className="font-semibold">{book.title}</h3>
            <p className="text-sm text-gray-600">{book.author}</p>
            <p className="text-sm text-gray-500">{book.genre}</p>
            <p className="text-xs mt-1 italic">Status: {book.status}</p>
            <div className="flex justify-between mt-3 text-sm">
              <button
                onClick={() => openEditModal(book)}
                className="text-blue-500"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(book._id)}
                className="text-red-500"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-lg w-full">
            <h2 className="text-xl font-semibold mb-4">
              {editingBook ? "Edit Book" : "Add Book"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                placeholder="Title"
                value={book.title}
                onChange={(e) => setBook({ ...book, title: e.target.value })}
                className="w-full px-4 py-2 border rounded"
              />
              <input
                type="text"
                placeholder="Author"
                value={book.author}
                onChange={(e) => setBook({ ...book, author: e.target.value })}
                className="w-full px-4 py-2 border rounded"
              />
              <input
                type="text"
                placeholder="Genre"
                value={book.genre}
                onChange={(e) => setBook({ ...book, genre: e.target.value })}
                className="w-full px-4 py-2 border rounded"
              />

              <div
                {...getImageRootProps()}
                className="border-2 border-dashed p-4 text-center rounded cursor-pointer"
              >
                <input {...getImageInputProps()} />
                {coverImage ? (
                  <img
                    src={URL.createObjectURL(coverImage)}
                    alt="Preview"
                    className="mx-auto w-24 h-24 object-cover"
                  />
                ) : editingBook?.coverImageUrl ? (
                  <img
                    src={editingBook.coverImageUrl}
                    alt="Preview"
                    className="mx-auto w-24 h-24 object-cover"
                  />
                ) : (
                  <p>Upload Cover Image</p>
                )}
              </div>

              <div
                {...getPdfRootProps()}
                className="border-2 border-dashed p-4 text-center rounded cursor-pointer"
              >
                <input {...getPdfInputProps()} />
                {pdf ? (
                  <p>{pdf.name}</p>
                ) : editingBook?.pdfUrl ? (
                  <p>PDF already uploaded</p>
                ) : (
                  <p>Upload PDF</p>
                )}
              </div>

              <div className="flex justify-between">
                <button
                  type="submit"
                  className="bg-blue-500 text-white px-4 py-2 rounded"
                >
                  {editingBook ? "Update" : "Add"}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="bg-gray-500 text-white px-4 py-2 rounded"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AddBookPage;
