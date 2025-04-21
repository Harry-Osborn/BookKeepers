import { Outlet } from "react-router-dom";

function AuthLayout() {
  return (
    <>
      <Outlet /> {/* nested routing or layout routing */}
    </>
  );
}

export default AuthLayout;
