import { Book, LogOut, Menu, UserCog } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Sheet, SheetContent, SheetTrigger } from "../ui/sheet";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { useDispatch, useSelector } from "react-redux";
import { logoutUser, resetTokenAndCredentials } from "@/store/auth-slice";
import { useEffect, useState } from "react";
import { fetchUserFromDB } from "@/services/api";
import logoUnq from '../../../bookFavicon/logoUnq.png';
function Navbar() {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [profileImageUrl, setProfileImageUrl] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const fetchImage = async () => {
      try {
        const userId = localStorage.getItem("userId");
        if (!userId) return;

        const user = await fetchUserFromDB();
        // const matchedUser = users.find(
        //   (u) =>
        //     String(u._id) === String(userId) || String(u.id) === String(userId)
        // );

        
          setProfileImageUrl(user.profileImageUrl);
        
      } catch (err) {
        console.error("⚠️ Error fetching user image:", err);
      }
    };

    fetchImage();
  }, []);

  useEffect(() => {
    const onScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleLogout = () => {
    dispatch(resetTokenAndCredentials());
    sessionStorage.clear();
    navigate("/auth/login");
  };

  const getInitials = () => {
    if (!user?.userName) return "U";
    const nameParts = user.userName.trim().split(" ");
    const first = nameParts[0]?.[0] || "";
    const last = nameParts[1]?.[0] || "";
    return (first + last).toUpperCase();
  };

  return (
    <header className={`sticky top-0 z-40 w-full transition-colors duration-300 ${scrolled ? 'bg-[#4b2e2e] border-gray-700 shadow-md' : 'bg-transparent'} backdrop-blur-sm`}>
      <div className="flex h-16 items-center justify-between px-4 md:px-8">
        <Link to="/books/home" className="flex items-center gap-2">
        <img
  src={logoUnq}
  alt="Logo"
  className="h-20 w-20 object-contain rounded-full shadow-md p-1 transition-transform duration-300 hover:scale-105"
/>
         
        </Link>

        <div className="flex items-center space-x-6">
          <nav className="hidden lg:flex space-x-8 text-gray-300 font-diphylleia text-lg transition-colors duration-300">
            <Link to="/books/home" className="hover:text-white transition duration-300">Home</Link>
            <Link to="/books/modify" className="hover:text-white transition duration-300">Add Book</Link>
            <Link to="/books/library" className="hover:text-white transition duration-300">Library</Link>
            <Link to="/books/about" className="hover:text-white transition duration-300">About</Link>
          </nav>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Avatar className="bg-gray-800 cursor-pointer border-2 border-gray-700 hover:border-pink-500 transition-all duration-300">
                {profileImageUrl ? (
                  <AvatarImage src={profileImageUrl} alt="User" />
                ) : (
                  <AvatarFallback className="bg-gray-800 text-white font-bold">
                    {getInitials()}
                  </AvatarFallback>
                )}
              </Avatar>
            </DropdownMenuTrigger>

            <DropdownMenuContent side="right" className="w-64 rounded-xl bg-gray-900 text-white border border-gray-700 shadow-lg">
              <div className="p-4">
                <p className="text-sm text-gray-400">Logged in as</p>
                <p className="text-lg font-semibold text-white">{user?.userName}</p>
              </div>
              <DropdownMenuSeparator className="bg-gray-700" />
              <DropdownMenuItem onClick={() => navigate("/books/account")} className="hover:bg-gray-800 px-4 py-2 flex items-center gap-3">
                <UserCog className="h-5 w-5 text-blue-400" /> <span>Account</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout} className="hover:bg-gray-800 px-4 py-2 flex items-center gap-3 text-red-500">
                <LogOut className="h-5 w-5" /> <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden hover:text-white text-white hover:bg-gray-800">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-full max-w-xs bg-gray-950 text-white border-r border-gray-700 px-6 py-8 shadow-lg">
              <nav className="flex flex-col items-center">
                <div className="flex-shrink-0 text-xl tracking-wide transition-all duration-300">
                  <span className="font-playwrite text-pink-300">Book</span>
                  <span className="text-pink-300 dark:text-white font-playwrite">Manager</span>
                </div>
                <nav className="pt-5 flex flex-col space-y-4 text-lg font-medium font-diphylleia transition-colors duration-300">
                  {["home", "modify", "library", "about"].map((path) => (
                    <Link
                      key={path}
                      to={`/books/${path}`}
                      className="px-4 py-2 rounded-lg transition duration-300 hover:text-pink-400"
                      onClick={() => setMenuOpen(false)}
                    >
                      {path.charAt(0).toUpperCase() + path.slice(1)}
                    </Link>
                  ))}
                </nav>
              </nav>
              <div className="mt-10 border-t border-gray-700 pt-6">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full text-white border-gray-600 hover:bg-gray-500 bg-gray-800 hover:text-pink-400 transition-all">
                      <UserCog className="mr-2" /> Account
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent side="bottom" className="w-full mt-2 bg-gray-900 text-white border border-gray-700 rounded-lg shadow-md">
                    <DropdownMenuItem onClick={() => { navigate("/books/account"); setMenuOpen(false); }} className="px-4 py-2 hover:bg-gray-800 flex items-center gap-2">
                      <UserCog className="h-5 w-5 text-blue-400" /> Account
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-gray-700" />
                    <DropdownMenuItem onClick={() => { handleLogout(); setMenuOpen(false); }} className="px-4 py-2 text-red-500 hover:bg-gray-800 flex items-center gap-2">
                      <LogOut className="h-5 w-5" /> Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}

export default Navbar;