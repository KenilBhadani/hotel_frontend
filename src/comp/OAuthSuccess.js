import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function OAuthSuccess() {
  const navigate = useNavigate();

  useEffect(() => {
    // Get token from URL
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (token) {
      // Optional: fetch user info from backend (use credentials for session cookie if set)
      fetch(`${process.env.REACT_APP_API_URL}/api/auth/me`, {
        credentials: 'include',
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((user) => {
          if (user.role === 'admin') {
            localStorage.setItem('adminToken', token);
            localStorage.setItem('adminUser', JSON.stringify(user));
            localStorage.setItem('adminRole', user.role);
            navigate('/admin', { replace: true });
          } else {
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));
            localStorage.setItem('role', user.role);
            navigate('/', { replace: true });
          }
        })
        .catch(() => {
          // If token invalid, redirect to login
          navigate("/login", { replace: true });
        });
    } else {
      // No token found, redirect to login
      navigate("/login", { replace: true });
    }
  }, [navigate]);

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "80vh" }}>
      <h2>Signing you in...</h2>
    </div>
  );
}
