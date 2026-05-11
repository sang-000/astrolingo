import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { registerUser } from "../api";
import { useAuth } from "../contexts/AuthContext";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("Creating your account...");
    try {
      const data = await registerUser({ username: name, email, password });

      // If server returned an error
      if (!data.message || String(data.message).toLowerCase().includes('error') || data.error) {
        const errMsg = String(data.message || data.error || "Registration failed");
        setMessage(errMsg);
        return;
      }

      // Success — show message then redirect to login
      setMessage("Registration successful! Redirecting to login...");
      setTimeout(() => navigate("/login"), 1500);

    } catch (err) {
      console.error(err);
      setMessage("Registration failed. Please check your connection.");
    }
  };

  return (
    <div className="nasa-auth-container">
      <div className="nasa-auth-card">
        <div className="nasa-auth-header">
          <h1 className="nasa-auth-title">Join the Mission</h1>
          <p className="nasa-auth-subtitle">Create your AstroLingo explorer account</p>
        </div>
        
        <form onSubmit={handleSubmit} className="nasa-auth-form">
          <div className="nasa-form-group">
            <label className="nasa-form-label">Full Name</label>
            <input
              type="text"
              className="nasa-form-input"
              placeholder="Enter your full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          
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
              placeholder="Create a secure password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          <button type="submit" className="nasa-btn nasa-btn-full">
            Launch Registration
          </button>
        </form>
        
        {message && (
          <div className={`nasa-message ${
            String(message).toLowerCase().includes('failed') ||
            String(message).toLowerCase().includes('error')
              ? 'error' : 'success'
          }`}>
            {message}
          </div>
        )}
        
        <div className="nasa-auth-footer">
          <p className="nasa-auth-link-text">
            Already have an account?{' '}
            <Link to="/login" className="nasa-auth-link">
              Sign In to AstroLingo
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
