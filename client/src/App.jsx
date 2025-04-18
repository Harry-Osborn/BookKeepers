import { Route, Routes } from "react-router-dom";
import AuthLayout from "./components/auth/layout";
import AuthLogin from "./pages/auth/login";
import AuthRegister from "./pages/auth/register";
import BookpageLayout from "./components/Home/layout";
import BookpageHome from "./pages/book-store/home";
import About from "./pages/book-store/about";
import BookLibrary from "./pages/book-store/library";
import ProfilePage from "./pages/book-store/profile";
import AddBookPage from "./pages/book-store/crudpage";
import NotFound from "./pages/not-found";
import CheckAuth from "./components/common/check-auth";
import UnauthPage from "./pages/unauth-page";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { checkAuth } from "./store/auth-slice";
import OtpModal from "./components/common/OtpModal";
import ReaderLayout from "./components/auth/readingLayout";
import BookDetails from "./pages/book-store/BookDetails";

function App() {
  const { user, isAuthenticated, isLoading } = useSelector(
    (state) => state.auth
  );
  const dispatch = useDispatch();

  useEffect(() => {
    const token = JSON.parse(sessionStorage.getItem("token"));
    dispatch(checkAuth(token));
  }, [dispatch]);

  // Wait until auth check is complete
  if (isLoading || isAuthenticated === null) return null;

  return (
    <Routes>
      <Route
        path="/"
        element={
          <CheckAuth isAuthenticated={isAuthenticated} user={user}>
            <div />
          </CheckAuth>
        }
      />

      <Route
        path="/auth"
        element={
          <CheckAuth isAuthenticated={isAuthenticated} user={user}>
            <AuthLayout />
          </CheckAuth>
        }
      >
        <Route path="login" element={<AuthLogin />} />
        <Route path="register" element={<AuthRegister />} />
        <Route path="verifyOtp" element={<OtpModal />} />
      </Route>

      <Route
        path="/books"
        element={
          <CheckAuth isAuthenticated={isAuthenticated} user={user}>
            <BookpageLayout />
          </CheckAuth>
        }
      >
        <Route path="home" element={<BookpageHome />} />
        <Route path="about" element={<About />} />
        <Route path="library" element={<BookLibrary />} />
        <Route path="account" element={<ProfilePage />} />
        <Route path="modify" element={<AddBookPage />} />
        <Route path="reader/:bookId" element={<ReaderLayout />} />
        <Route path="bookDetail/:bookId" element={<BookDetails />} />
      </Route>

      <Route path="/unauth-page" element={<UnauthPage />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
