import { Navigate, useLocation } from "react-router-dom";

function CheckAuth({ isAuthenticated, user, children }) {
  const location = useLocation();

  console.log("Path:", location.pathname, "| Authenticated:", isAuthenticated);

  // Wait until auth state is resolved
  if (isAuthenticated === null || isAuthenticated === undefined) {
    return null; // or a loading spinner
  }

  // Redirect root path to login or books home
  if (location.pathname === "/") {
    return isAuthenticated ? (
      <Navigate to="/books/home" />
    ) : (
      <Navigate to="/auth/login" />
    );
  }

  // Not authenticated and accessing inner pages (except login/register)
  if (
    !isAuthenticated &&
    !(
      location.pathname.includes("/login") ||
      location.pathname.includes("/register")
    )
  ) {
    return <Navigate to="/auth/login" />;
  }

  // Authenticated but trying to access login or register
  if (
    isAuthenticated &&
    (location.pathname.includes("/login") ||
      location.pathname.includes("/register"))
  ) {
    return <Navigate to="/books/home" />;
  }

  return <>{children}</>;
}

export default CheckAuth;
