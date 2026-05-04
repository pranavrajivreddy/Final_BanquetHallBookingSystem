import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ApiError, apiRequest } from "../lib/api";

const Register = () => {
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setIsSubmitting(true);
      await apiRequest<{ message: string }>("/api/register", {
        method: "POST",
        body: JSON.stringify({ mobile, password })
      });

      alert("Registered successfully! Please login.");
      navigate("/login");
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "Error registering user");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-shell">
      <section className="auth-card">
        <div className="auth-showcase">
          <div className="eyebrow">Guest Membership</div>
          <h1 className="auth-title">Create Your HSE Account</h1>
          <p className="auth-description">
            Register once to submit booking requests, follow approval updates, and manage your event journey from one place.
          </p>
        </div>

        <div className="auth-form">
          <div className="eyebrow" style={{ color: "var(--gold)" }}>Create Account</div>
          <h2 className="section-title" style={{ fontSize: "2.35rem" }}>Join the Guest Portal</h2>
          <p className="auth-description">Use your mobile number to get started.</p>

          <form onSubmit={handleRegister} className="info-stack">
            <div>
              <label className="label">Mobile Number</label>
              <input
                className="text-input"
                placeholder="Enter your mobile number"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="label">Password</label>
              <input
                className="text-input"
                type="password"
                placeholder="Create a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button className="primary-button" disabled={isSubmitting}>
              {isSubmitting ? "Registering..." : "Create Account"}
            </button>
          </form>
        </div>
      </section>
    </div>
  );
};

export default Register;
