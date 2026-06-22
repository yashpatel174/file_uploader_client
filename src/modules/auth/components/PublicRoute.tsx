import { Navigate, Outlet, useLocation } from "react-router-dom";

const PublicRoute = () => {
  const accessToken = localStorage.getItem("accessToken");
  const refreshToken = localStorage.getItem("refreshToken");

  const isAuthenticated = !!accessToken && !!refreshToken;

  const location = useLocation();

  const redirectPath = location.state?.from || "/users";

  if (isAuthenticated) {
    return <Navigate to={redirectPath} replace />;
  }

  return <Outlet />;
};

export default PublicRoute;
