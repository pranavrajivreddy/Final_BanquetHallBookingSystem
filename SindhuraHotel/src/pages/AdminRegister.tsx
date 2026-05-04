import { useState } from "react";
import { ApiError, apiRequest } from "../lib/api";

const AdminRegister = () => {
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    try {
      setIsSubmitting(true);
      const data = await apiRequest<{ message: string }>("/api/admin/request", {
        method: "POST",
        body: JSON.stringify({ name, mobile, password })
      });

      setMessage(data.message);
      setName("");
      setMobile("");
      setPassword("");
    } catch (error) {
      setMessage(error instanceof ApiError ? error.message : "Server error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-shell">
      <section className="auth-card">
        <div className="auth-showcase">
          <div className="eyebrow">Admin Access Request</div>
          <h1 className="auth-title">Request Back Office Access</h1>
          <p className="auth-description">
            Concierge administrators can request access here. Every request is reviewed by the HSE super admin before activation.
          </p>
        </div>

        <div className="auth-form">
          <div className="eyebrow" style={{ color: "var(--gold)" }}>Support Desk</div>
          <h2 className="section-title" style={{ fontSize: "2.35rem" }}>Admin Registration Help</h2>
          <p className="auth-description">
            Once approved, you can sign in and manage customer booking approvals like any other admin.
          </p>

          <form onSubmit={handleSubmit} className="info-stack">
            <div>
              <label className="label">Full Name</label>
              <input
                className="text-input"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

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
              <label className="label">Create Password</label>
              <input
                className="text-input"
                type="password"
                placeholder="Create a secure password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button className="primary-button" disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit Request"}
            </button>
          </form>

          {message && (
            <p className={message.toLowerCase().includes("error") ? "error-copy" : "muted-copy"}>
              {message}
            </p>
          )}
        </div>
      </section>
    </div>
  );
};

export default AdminRegister;
