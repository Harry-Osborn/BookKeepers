import { Outlet } from "react-router-dom";
import Navbar from "../common/navbar";
import bgImage from "../../../bookFavicon/bookshelf.jpg";
import { useSelector } from "react-redux";

function BookpageLayout() {
  const { isFullscreen } = useSelector((state) => state.ui);

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Static Background Image */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-center brightness-[.50]"
        style={{ backgroundImage: `url(${bgImage})` }}
      ></div>

      {/* Floating Foreground Content */}
      <div className="relative z-10 backdrop-blur-sm text-white">
      {!isFullscreen && <Navbar />}

        <main className="px-4 sm:px-6 lg:px-10 py-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default BookpageLayout;
