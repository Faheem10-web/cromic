import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Login.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [submitting, setSubmitting] = useState(false);
  
  const { login, admin } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (admin) {
      navigate("/admin/dashboard");
    }
  }, [admin, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg("Please fill in all fields.");
      return;
    }

    try {
      setSubmitting(true);
      setErrorMsg("");
      const result = await login(email, password);
      if (!result.success) {
        setErrorMsg(result.error);
      } else {
        navigate("/admin/dashboard");
      }
    } catch (err) {
      setErrorMsg("An unexpected error occurred. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="login">

      <div className="login-container">

        <h1>LOGIN</h1>

        {errorMsg && (
          <div style={{ color: "#ff4a4a", fontSize: "0.8rem", textAlign: "center", marginBottom: "1rem", letterSpacing: "1px" }}>
            {errorMsg.toUpperCase()}
          </div>
        )}

        <form className="login-form" onSubmit={handleSubmit}>

          <div className="field">
            <label>EMAIL</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
          </div>

          <div className="field">

            <div className="password-row">
              <label>PASSWORD</label>

              <a href="#" onClick={(e) => { e.preventDefault(); alert("Please contact the administrator to reset your password."); }}>FORGOT PASSWORD</a>
            </div>

            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
            />

          </div>

          <button type="submit" className="login-btn" disabled={submitting}>
            {submitting ? "LOGGING IN..." : "LOG IN"}
          </button>

          <a href="#" className="register-link" onClick={(e) => { e.preventDefault(); alert("Admin registration is disabled."); }}>
            CREATE ACCOUNT
          </a>

        </form>

      </div>

    </section>
  );
}