import { Outlet } from "react-router-dom";
import Navbar from "../common/navbar";

function BookpageLayout() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <Navbar />
      <main className="container mx-auto p-6 flex-grow">
        <Outlet />
      </main>
      <footer className="bg-blue-600 text-white text-center py-3 mt-6">
        © 2025 Book Management System
      </footer>
    </div>
  );
}

export default BookpageLayout;
