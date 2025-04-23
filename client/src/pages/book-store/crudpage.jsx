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
    description: "",
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
    formData.append("description", book.description);
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
    setBook({
      title: "",
      author: "",
      genre: "",
      status: "Unread",
      description: "",
    });
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
      description: book.description || "",
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
  const statuses = ["Unread", "Reading", "Completed"];

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-transparent to-gray-900 text-white">
      <div className="mx-auto p-6 max-w-7xl">
        <h2 className="text-3xl font-bold mb-6 text-center border-b border-gray-700 pb-4">
          📚Update your books
        </h2>

        {/* Search and Filters */}
        <div className="flex flex-wrap items-center gap-4 mb-8 justify-center">
          <input
            type="text"
            placeholder="Search books..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-4 py-2 w-56 rounded-md bg-gray-800 border border-gray-700 placeholder-gray-400 text-white"
          />

          <select
            value={genreFilter}
            onChange={(e) => setGenreFilter(e.target.value)}
            className="px-4 py-2 w-48 rounded-md bg-gray-800 border border-gray-700 text-white"
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
            className="px-4 py-2 w-48 rounded-md bg-gray-800 border border-gray-700 text-white"
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
              document.body.style.overflow = "hidden";
            }}
            className="ml-auto bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-md shadow"
          >
            + Add Book
          </button>
        </div>

        {/* Books Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredBooks.map((book) => (
            <div
              key={book._id}
              className="bg-gray-800 rounded-xl shadow hover:shadow-xl transition duration-200"
            >
              <img
                src={book.coverImageUrl}
                alt={book.title}
                className="w-full h-44 object-cover mb-4 rounded-md border border-gray-700"
              />
              <div className="px-5 py-2">
                <h3 className="font-semibold text-lg truncate text-white">
                  {book.title}
                </h3>
                <p className="text-sm text-gray-400 truncate">
                  by {book.author}
                </p>
                <p className="text-sm text-gray-500">Genre: {book.genre}</p>
                <p className="text-xs mt-1 italic text-gray-500">
                  Status: {book.status}
                </p>
                <div className="flex justify-between mt-4 text-sm">
                  <button
                    onClick={() => openEditModal(book)}
                    className="text-blue-400 hover:text-blue-300"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(book._id)}
                    className="text-red-400 hover:text-red-300"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Modal */}
        {isModalOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-start z-50 py-24 overflow-y-auto"
            onClick={() => {}}
          >
            <div className="bg-gray-900 text-white p-6 rounded-lg max-w-lg w-full shadow-xl relative animate-fadeIn">
              <h2 className="text-2xl font-semibold mb-6 text-center border-b border-gray-700 pb-2">
                {editingBook ? "Edit Book" : "Add Book"}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <input
                  type="text"
                  placeholder="Title"
                  value={book.title}
                  onChange={(e) => setBook({ ...book, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-700 bg-gray-800 rounded"
                />
                <input
                  type="text"
                  placeholder="Author"
                  value={book.author}
                  onChange={(e) => setBook({ ...book, author: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-700 bg-gray-800 rounded"
                />
                <input
                  type="text"
                  placeholder="Genre"
                  value={book.genre}
                  onChange={(e) => setBook({ ...book, genre: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-700 bg-gray-800 rounded"
                />
                <textarea
                  placeholder="Description"
                  value={book.description}
                  onChange={(e) =>
                    setBook({ ...book, description: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-700 bg-gray-800 rounded resize-none"
                  rows={3}
                ></textarea>

                <div
                  {...getImageRootProps()}
                  className="border-2 border-dashed p-4 text-center rounded-md cursor-pointer bg-gray-800 hover:bg-gray-700"
                >
                  <input {...getImageInputProps()} />
                  {coverImage ? (
                    <img
                      src={URL.createObjectURL(coverImage)}
                      alt="Preview"
                      className="mx-auto w-24 h-24 object-cover rounded"
                    />
                  ) : editingBook?.coverImageUrl ? (
                    <img
                      src={editingBook.coverImageUrl}
                      alt="Preview"
                      className="mx-auto w-24 h-24 object-cover rounded"
                    />
                  ) : (
                    <p className="text-gray-400">Upload Cover Image</p>
                  )}
                </div>

                <div
                  {...getPdfRootProps()}
                  className="border-2 border-dashed p-4 text-center rounded-md cursor-pointer bg-gray-800 hover:bg-gray-700"
                >
                  <input {...getPdfInputProps()} />
                  {pdf ? (
                    <p>{pdf.name}</p>
                  ) : editingBook?.pdfUrl ? (
                    <p>PDF already uploaded</p>
                  ) : (
                    <p className="text-gray-400">Upload PDF</p>
                  )}
                </div>

                <div className="flex justify-between pt-4">
                  <button
                    type="submit"
                    className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded text-white"
                  >
                    {editingBook ? "Update" : "Add"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      resetForm();
                      document.body.style.overflow = "auto";
                    }}
                    className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded text-white"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AddBookPage;
