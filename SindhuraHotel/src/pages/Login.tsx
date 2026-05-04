import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ApiError, apiRequest } from "../lib/api";

const Login = () => {
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!mobile || !password) {
      return alert("Please enter mobile and password");
    }

    try {
      setIsSubmitting(true);
      const data = await apiRequest<{
        token: string;
        role: string;
        userId: number;
      }>("/api/login", {
        method: "POST",
        body: JSON.stringify({ mobile, password })
      });

      localStorage.setItem("role", data.role);
      localStorage.setItem("userId", String(data.userId));
      localStorage.setItem("token", data.token);

      if (data.role === "admin") {
        navigate("/admin-dashboard");
      } else if (data.role === "superadmin") {
        navigate("/superadmin");
      } else {
        navigate("/");
      }
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "Server error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-shell">
      <section className="auth-card">
        <div className="auth-showcase">
          <div className="eyebrow">Private Access</div>
          <h1 className="auth-title">Welcome Back to HSE</h1>
          <p className="auth-description">
            Sign in to manage reservations, track event approvals, and continue planning with the Hotel Sindhura East Court team.
          </p>
        </div>

        <div className="auth-form">
          <div className="eyebrow" style={{ color: "var(--gold)" }}>Member Sign In</div>
          <h2 className="section-title" style={{ fontSize: "2.35rem" }}>Access Your Account</h2>
          <p className="auth-description">Use your mobile number and password to continue.</p>

          <form onSubmit={handleLogin} className="info-stack">
            <div>
              <label className="label">Mobile Number</label>
              <input
                className="text-input"
                placeholder="Enter your mobile number"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
              />
            </div>

            <div>
              <label className="label">Password</label>
              <input
                className="text-input"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button type="submit" className="primary-button" disabled={isSubmitting}>
              {isSubmitting ? "Logging in..." : "Sign In"}
            </button>
          </form>

          <p className="auth-links">
            New guest? <Link to="/register">Create an account</Link>
          </p>
        </div>
      </section>
    </div>
  );
};

export default Login;
