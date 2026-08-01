import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("staffToken");
  const user = localStorage.getItem("staffUser");

  // If NOT logged in → go to login
  if (!token || !user) {
    return <Navigate to="/staff/login" replace />;
  }

  // If logged in → allow page
  return children;
};

export default ProtectedRoute;
