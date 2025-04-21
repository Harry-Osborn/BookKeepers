// Imports Route and Routes from React Router DOM to define application routing.
import { Route, Routes } from "react-router-dom";
// Import layout and pages for authentication (login, register).
import AuthLayout from "./components/auth/layout";
import AuthLogin from "./pages/auth/login";
import AuthRegister from "./pages/auth/register";
import OtpModal from "./components/common/OtpModal";
// Import layout and pages for the main book store section: home, about, library, profile, and CRUD (add/edit book) page.
import BookpageLayout from "./components/Home/layout";
import BookpageHome from "./pages/book-store/home";
import About from "./pages/book-store/about";
import BookLibrary from "./pages/book-store/library";
import BookDetails from "./pages/book-store/BookDetails";
import ProfilePage from "./pages/book-store/profile";
import AddBookPage from "./pages/book-store/crudpage";
import ReaderLayout from "./components/auth/readingLayout";
// Imports a 404 error page for undefined routes.
import NotFound from "./pages/not-found";
// Imports a page to show when unauthenticated users try to access restricted pages.
import UnauthPage from "./pages/unauth-page";
// Imports a wrapper component that checks if the user is authenticated before allowing access to certain routes.
import CheckAuth from "./components/common/check-auth";
// useSelector gets Redux state; useDispatch is used to send actions to the Redux store.
import { useDispatch, useSelector } from "react-redux";
// React hook to perform side effects — here it’s used to check authentication when the app loads.
import { useEffect } from "react";
// Imports an action creator to verify user authentication status using a stored token
import { checkAuth } from "./store/auth-slice";

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
