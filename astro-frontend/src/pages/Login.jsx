import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { loginUser } from "../api";
import { useAuth } from "../contexts/AuthContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  
  const from = location.state?.from?.pathname || "/";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("Logging in...");
    try {
      const data = await loginUser({ email, password });

      // If no token came back, show the error message
      if (!data.token) {
        // Safely convert to string — server may send error as object or string
        const errMsg = String(data.message || data.error || "Invalid credentials");
        setMessage(errMsg);
        return;
      }

      // Success — store token + user, then redirect
      login(data.token, data.user);
      navigate(from, { replace: true });
    } catch (err) {
      console.error(err);
      setMessage("Login failed. Please check your connection.");
    }
  };

  return (
    <div className="nasa-auth-container">
      <div className="nasa-auth-card">
        <div className="nasa-auth-header">
          <h1 className="nasa-auth-title">Welcome Back</h1>
          <p className="nasa-auth-subtitle">Access your AstroLingo mission control</p>
        </div>
        
        <form onSubmit={handleSubmit} className="nasa-auth-form">
          <div className="nasa-form-group">
            <label className="nasa-form-label">Email Address</label>
            <input
              type="email"
              className="nasa-form-input"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div className="nasa-form-group">
            <label className="nasa-form-label">Password</label>
            <input
              type="password"
              className="nasa-form-input"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          <div className="nasa-form-group">
            <button type="submit" className="nasa-form-btn">
              Login to Mission Control
            </button>
          </div>
          
          {message && (
            <div className={`nasa-form-message ${
              String(message).toLowerCase().includes('success') ? 'success' : 'error'
            }`}>
              {message}
            </div>
          )}
        </form>
        
        <div className="nasa-auth-footer">
          <p className="nasa-auth-link-text">
            Don't have an account?{' '}
            <Link to="/register" className="nasa-auth-link">
              Register for AstroLingo
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
