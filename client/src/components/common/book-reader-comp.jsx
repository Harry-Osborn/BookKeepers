import { useEffect, useRef, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { updateBookStatus, updateBookProgress } from "../../services/api";
import { useDispatch } from "react-redux";
import { setFullscreen } from "@/store/ui-slice/ui-slice";


pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

const BookReaderModal = ({ book, onClose, setBooks }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(null);
  const [zoom, setZoom] = useState(1.0);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const viewerRef = useRef(null);
  const modalRef = useRef(null);
  const [pageWidth, setPageWidth] = useState(0);

  const dispatch = useDispatch();



  useEffect(() => {
    const init = async () => {
      const savedPage = parseInt(localStorage.getItem(`book-${book._id}-page`) || "1");
      setCurrentPage(savedPage);
      // setZoom(1.0);

      if (book.status === "Unread") {
        await updateBookStatus(book._id, "Reading");
        setBooks(prevBooks =>
          prevBooks.map(b => (b._id === book._id ? { ...b, status: "Reading" } : b))
        );
      }

      setTimeout(() => {
        modalRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 50);
    };

    init();
  }, [book, setBooks]);

  useEffect(() => {
    const handleResize = () => {
      if (viewerRef.current) {
        setPageWidth(viewerRef.current.offsetWidth);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [book]);

  const handleClose = async () => {

    try {
      if (book && totalPages) {
        const progress = Math.floor((currentPage / totalPages) * 100);

        await updateBookProgress(book._id, {
          lastReadPage: currentPage,
          totalPages,
          progress,
        });

        const newStatus = progress === 100 ? "Completed" : "Reading";
        console.log("new status is ",newStatus);

        if (book.status !== newStatus) {
          await updateBookStatus(book._id, newStatus);
          setBooks(prevBooks =>
            prevBooks.map(b =>
              b._id === book._id ? { ...b, status: newStatus } : b
            )
          );
        }
        console.log("book updated");

        localStorage.setItem(`book-${book._id}-page`, currentPage);
        dispatch(setFullscreen(false));
      }
    } catch (err) {
      console.warn("Could not update progress:", err);
      dispatch(setFullscreen(false));
    }

    onClose();
  };


const toggleFullScreen = () => {
  setIsFullScreen((prev) => {
    dispatch(setFullscreen(!prev)); // update global state
    return !prev;
  });
};



  return (
    <div
      ref={modalRef}
      className={`fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[100] transition-all duration-300 ${
        isFullScreen ? "p-0" : "p-4"
      }`}
    >
      <div
        className={`${
          isFullScreen ? "w-full h-full" : "w-full max-w-5xl h-[90vh]"
        } relative bg-gray-900 text-white rounded-xl shadow-lg flex flex-col overflow-hidden`}
      >
        <div className="flex justify-between items-center px-4 py-2 bg-gray-800 border-b border-gray-700">
          <h3 className="text-lg font-semibold truncate">{book.title}</h3>
          <div className="flex gap-2">
            <button
              onClick={toggleFullScreen}
              className="text-gray-300 hover:text-white px-2 py-1 rounded border border-gray-700"
            >
              {isFullScreen ? "⤢" : "⤢"}
            </button>
            <button
              onClick={handleClose}
              className="text-red-400 hover:text-red-600 px-2 py-1 rounded border border-red-400"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="flex justify-between items-center px-4 py-2 bg-gray-800">
          <div className="flex gap-2 items-center">
            <button
              onClick={() => setZoom(z => Math.max(0.5, z - 0.1))}
              className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded"
            >
              −
            </button>
            <button
              onClick={() => setZoom(z => z + 0.1)}
              className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded"
            >
              +
            </button>
            <a
              href={book.pdfUrl}
              download
              target="_blank"
              rel="noopener noreferrer"
              className="ml-3 px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded"
            >
              ⬇
            </a>
          </div>
          <span className="text-sm text-gray-400">
            Page {currentPage} of {totalPages || "?"}
          </span>
        </div>

        <div ref={viewerRef} className="flex-1 overflow-auto p-4 bg-gray-950">
          <Document
            file={book.pdfUrl}
            onLoadSuccess={({ numPages }) => setTotalPages(numPages)}
            loading={<div className="text-center text-gray-400">Loading PDF...</div>}
          >
            <Page
              pageNumber={currentPage}
              width={pageWidth > 0 ? pageWidth * zoom : undefined}
              renderAnnotationLayer={false}
              renderTextLayer={false}
              className="!mb-0 mx-auto rounded shadow-lg border border-gray-800 bg-white"
            />
          </Document>
        </div>

        <div className="px-4 py-2 bg-gray-800 border-t border-gray-700 flex justify-between items-center">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded"
            disabled={currentPage <= 1}
          >
            ←
          </button>
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages || 1, p + 1))}
            className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded"
            disabled={currentPage >= totalPages}
          >
            →
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookReaderModal;
