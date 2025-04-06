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
import { logoutUser } from "@/store/auth-slice";
import { useEffect, useState } from "react";
import { fetchUserFromDB } from "@/services/api";

function Navbar() {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [profileImageUrl, setProfileImageUrl] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const fetchImage = async () => {
      try {
        const userId = localStorage.getItem("userId");
        if (!userId) return;

        const users = await fetchUserFromDB();
        const matchedUser = users.find(
          (u) =>
            String(u._id) === String(userId) || String(u.id) === String(userId)
        );

        if (matchedUser?.profileImageUrl) {
          setProfileImageUrl(matchedUser.profileImageUrl);
        }
      } catch (err) {
        console.error("⚠️ Error fetching user image:", err);
      }
    };

    fetchImage();
  }, []);

  const handleLogout = () => {
    dispatch(logoutUser());
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
    <header className="sticky top-0 z-40 w-full bg-white shadow-md border-b">
      <div className="flex h-16 items-center justify-between px-4 md:px-8">
        <Link to="/books/home" className="flex items-center gap-2">
          <Book className="h-6 w-6 text-blue-500" />
          <span className="text-xl font-extrabold text-blue-600">
            Book Manager
          </span>
        </Link>

        <nav className="hidden lg:flex space-x-6 text-gray-700 font-medium">
          <Link to="/books/home" className="hover:text-blue-500">
            Home
          </Link>
          <Link to="/books/modify" className="hover:text-blue-500">
            Add Book
          </Link>
          <Link to="/books/library" className="hover:text-blue-500">
            Library
          </Link>
          <Link to="/books/about" className="hover:text-blue-500">
            About
          </Link>
        </nav>

        {/* Avatar */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Avatar className="bg-gray-800 cursor-pointer">
              {profileImageUrl ? (
                <AvatarImage src={profileImageUrl} alt="User" />
              ) : (
                <AvatarFallback className="bg-gray-800 text-white font-bold">
                  {getInitials()}
                </AvatarFallback>
              )}
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="right" className="w-56">
            <DropdownMenuLabel>
              Logged in as <span className="font-bold">{user?.userName}</span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate("/books/account")}>
              <UserCog className="mr-2 h-4 w-4" /> Account
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-red-500">
              <LogOut className="mr-2 h-4 w-4" /> Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Mobile Menu */}
        <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="lg:hidden">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-full max-w-xs">
            <nav className="flex flex-col space-y-6 text-lg font-medium mt-6">
              {["home", "modify", "library", "about"].map((path) => (
                <Link
                  key={path}
                  to={`/books/${path}`}
                  className="hover:text-blue-500"
                  onClick={() => setMenuOpen(false)}
                >
                  {path.charAt(0).toUpperCase() + path.slice(1)}
                </Link>
              ))}
            </nav>
            <div className="mt-6">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full">
                    <UserCog className="mr-2" /> Account
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent side="right" className="w-full">
                  <DropdownMenuItem onClick={() => navigate("/books/account")}>
                    <UserCog className="mr-2 h-4 w-4" /> Account
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="text-red-500"
                  >
                    <LogOut className="mr-2 h-4 w-4" /> Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}

export default Navbar;
