import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { ApiError, apiRequest, getAuthToken } from "../lib/api";

type AdminRequest = {
  id: number;
  name: string;
  mobile: string;
  status: string;
  created_at: string;
};

const SuperAdminDashboard = () => {
  const role = localStorage.getItem("role");
  const token = getAuthToken();

  if (role !== "superadmin" || !token) {
    return <Navigate to="/login" />;
  }

  const [admins, setAdmins] = useState<AdminRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [processingId, setProcessingId] = useState<number | null>(null);

  const fetchPendingAdmins = async () => {
    try {
      setError("");
      const data = await apiRequest<{ requests: AdminRequest[] }>("/api/admin/pending", {}, true);
      setAdmins(data.requests);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Unable to load admin requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingAdmins();
  }, []);

  const approveAdmin = async (id: number) => {
    try {
      setProcessingId(id);
      await apiRequest<{ message: string }>(`/api/admin/approve/${id}`, { method: "POST" }, true);
      setAdmins((prev) => prev.filter((admin) => admin.id !== id));
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "Unable to approve request");
    } finally {
      setProcessingId(null);
    }
  };

  const deleteAdmin = async (id: number) => {
    try {
      setProcessingId(id);
      await apiRequest<{ message: string }>(`/api/admin/${id}`, { method: "DELETE" }, true);
      setAdmins((prev) => prev.filter((admin) => admin.id !== id));
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "Unable to delete request");
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="page-shell">
      <div className="dashboard-layout">
        <div className="dashboard-header">
          <div>
            <div className="eyebrow" style={{ color: "var(--gold)" }}>Executive Control</div>
            <h1 className="dashboard-title">Super Admin Review</h1>
            <p className="dashboard-description">
              Review new admin access requests and decide who can manage banquet operations across the platform.
            </p>
          </div>
        </div>

        <div className="dashboard-grid">
          <div className="stats-card">
            <div className="stats-label">Pending Requests</div>
            <div className="stats-value">{admins.length}</div>
            <div className="stats-footnote">Awaiting super admin action</div>
          </div>
          <div className="stats-card">
            <div className="stats-label">Review Status</div>
            <div className="stats-value">{loading ? "..." : "Live"}</div>
            <div className="stats-footnote">Real-time request moderation</div>
          </div>
          <div className="stats-card">
            <div className="stats-label">Role Approval</div>
            <div className="stats-value">Admin</div>
            <div className="stats-footnote">Approved requests become active admins</div>
          </div>
        </div>

        {loading ? (
          <p className="muted-copy">Loading...</p>
        ) : error ? (
          <p className="error-copy">{error}</p>
        ) : admins.length === 0 ? (
          <p className="empty-copy">No pending requests</p>
        ) : (
          <div className="request-list">
            {admins.map((admin) => (
              <article key={admin.id} className="request-card">
                <div className="request-topline">
                  <div>
                    <div className="detail-item-label">Applicant</div>
                    <h3 className="booking-title">{admin.name}</h3>
                  </div>
                  <span className="status-pill status-pending">Pending</span>
                </div>

                <div className="booking-meta">
                  <span>{admin.mobile}</span>
                  <span>{new Date(admin.created_at).toLocaleString()}</span>
                </div>

                <div className="request-actions">
                  <button
                    className="primary-button"
                    disabled={processingId === admin.id}
                    onClick={() => approveAdmin(admin.id)}
                  >
                    {processingId === admin.id ? "Processing..." : "Approve Request"}
                  </button>

                  <button
                    className="danger-button"
                    disabled={processingId === admin.id}
                    onClick={() => deleteAdmin(admin.id)}
                  >
                    Reject Request
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
