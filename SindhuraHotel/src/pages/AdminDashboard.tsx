import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ApiError, apiRequest, getAuthToken, getUserRole } from "../lib/api";

type AdminBooking = {
  id: number;
  user_id: number;
  name: string;
  date: string;
  eventType: string;
  decoration: string;
  food: string;
  guests: number;
  requests: string;
  status: "Pending" | "Approved" | "Rejected";
  mobile: string;
};

const getStatusClassName = (status: AdminBooking["status"]) => {
  if (status === "Approved") {
    return "status-approved";
  }

  if (status === "Rejected") {
    return "status-rejected";
  }

  return "status-pending";
};

const AdminDashboard = () => {
  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const navigate = useNavigate();

  const fetchBookings = async () => {
    if (!getAuthToken()) {
      navigate("/login", { replace: true });
      return;
    }

    if (getUserRole() !== "admin") {
      navigate("/", { replace: true });
      return;
    }

    try {
      setIsLoading(true);
      setError("");
      const data = await apiRequest<{ bookings: AdminBooking[] }>("/admin/bookings", {}, true);
      setBookings(data.bookings);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Unable to fetch bookings");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const updateStatus = async (id: number, status: "Approved" | "Rejected") => {
    try {
      setUpdatingId(id);
      await apiRequest<{ message: string }>(`/bookings/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ status })
      }, true);
      await fetchBookings();
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "Unable to update booking");
    } finally {
      setUpdatingId(null);
    }
  };

  const pendingCount = bookings.filter((booking) => booking.status === "Pending").length;
  const approvedCount = bookings.filter((booking) => booking.status === "Approved").length;

  return (
    <div className="page-shell">
      <div className="dashboard-layout">
        <div className="dashboard-header">
          <div>
            <div className="eyebrow" style={{ color: "var(--gold)" }}>Operations Console</div>
            <h1 className="dashboard-title">Booking Dashboard</h1>
            <p className="dashboard-description">
              Manage incoming event requests, review client preferences, and approve or reject bookings with confidence.
            </p>
          </div>
        </div>

        <div className="dashboard-grid">
          <div className="stats-card">
            <div className="stats-label">Pending Requests</div>
            <div className="stats-value">{pendingCount}</div>
            <div className="stats-footnote">Awaiting admin review</div>
          </div>
          <div className="stats-card">
            <div className="stats-label">Confirmed Bookings</div>
            <div className="stats-value">{approvedCount}</div>
            <div className="stats-footnote">Approved across the system</div>
          </div>
          <div className="stats-card">
            <div className="stats-label">Total Requests</div>
            <div className="stats-value">{bookings.length}</div>
            <div className="stats-footnote">Current workload snapshot</div>
          </div>
        </div>

        {isLoading && <p className="muted-copy">Loading bookings...</p>}
        {error && <p className="error-copy">{error}</p>}
        {!isLoading && !error && bookings.length === 0 && <p className="empty-copy">No bookings yet.</p>}

        <div className="booking-list">
          {bookings.map((booking) => (
            <article key={booking.id} className="booking-card">
              <div className="booking-topline">
                <div>
                  <div className="detail-item-label">Client</div>
                  <h3 className="booking-title">{booking.name}</h3>
                </div>
                <span className={`status-pill ${getStatusClassName(booking.status)}`}>{booking.status}</span>
              </div>

              <div className="booking-meta">
                <span>{booking.mobile}</span>
                <span>{new Date(booking.date).toLocaleDateString()}</span>
                <span>{booking.eventType}</span>
                <span>{booking.guests} guests</span>
                <span>{booking.food}</span>
                <span>{booking.decoration}</span>
              </div>

              {booking.requests ? (
                <p className="section-description" style={{ marginTop: "14px" }}>{booking.requests}</p>
              ) : null}

              {booking.status === "Pending" && (
                <div className="request-actions">
                  <button
                    className="primary-button"
                    disabled={updatingId === booking.id}
                    onClick={() => updateStatus(booking.id, "Approved")}
                  >
                    {updatingId === booking.id ? "Updating..." : "Approve"}
                  </button>

                  <button
                    className="danger-button"
                    disabled={updatingId === booking.id}
                    onClick={() => updateStatus(booking.id, "Rejected")}
                  >
                    Reject
                  </button>
                </div>
              )}
            </article>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
