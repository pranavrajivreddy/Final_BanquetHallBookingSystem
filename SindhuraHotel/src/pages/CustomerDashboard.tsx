import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ApiError, apiRequest, getAuthToken } from "../lib/api";

type Booking = {
  id: number;
  name: string;
  date: string;
  eventType: string;
  decoration: string;
  food: string;
  guests: number;
  requests: string;
  status: "Pending" | "Approved" | "Rejected";
};

const getStatusClassName = (status: Booking["status"]) => {
  if (status === "Approved") {
    return "status-approved";
  }

  if (status === "Rejected") {
    return "status-rejected";
  }

  return "status-pending";
};

const CustomerDashboard = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const loadBookings = async () => {
      if (!getAuthToken()) {
        navigate("/login", { replace: true });
        return;
      }

      try {
        setIsLoading(true);
        setError("");
        const data = await apiRequest<{ bookings: Booking[] }>("/bookings", {}, true);
        setBookings(data.bookings);
      } catch (err) {
        setError(err instanceof ApiError ? err.message : "Unable to load bookings");
      } finally {
        setIsLoading(false);
      }
    };

    loadBookings();
  }, [navigate]);

  const approvedCount = bookings.filter((booking) => booking.status === "Approved").length;
  const pendingCount = bookings.filter((booking) => booking.status === "Pending").length;

  return (
    <div className="page-shell">
      <div className="dashboard-layout">
        <div className="dashboard-header">
          <div>
            <div className="eyebrow" style={{ color: "var(--gold)" }}>Guest Dashboard</div>
            <h1 className="dashboard-title">Your Reservations</h1>
            <p className="dashboard-description">
              Track booking approvals, upcoming event requests, and your planning progress at HSE.
            </p>
          </div>
        </div>

        <div className="dashboard-grid">
          <div className="stats-card">
            <div className="stats-label">Total Requests</div>
            <div className="stats-value">{bookings.length}</div>
            <div className="stats-footnote">All booking submissions linked to your account</div>
          </div>
          <div className="stats-card">
            <div className="stats-label">Pending Review</div>
            <div className="stats-value">{pendingCount}</div>
            <div className="stats-footnote">Awaiting admin confirmation</div>
          </div>
          <div className="stats-card">
            <div className="stats-label">Approved Events</div>
            <div className="stats-value">{approvedCount}</div>
            <div className="stats-footnote">Confirmed by the banquet team</div>
          </div>
        </div>

        {isLoading && <p className="muted-copy">Loading your bookings...</p>}
        {error && <p className="error-copy">{error}</p>}
        {!isLoading && !error && bookings.length === 0 && (
          <p className="empty-copy">You have not submitted any bookings yet.</p>
        )}

        <div className="booking-list">
          {bookings.map((booking) => (
            <article key={booking.id} className="booking-card">
              <div className="booking-topline">
                <div>
                  <div className="detail-item-label">Event</div>
                  <h3 className="booking-title">{booking.eventType}</h3>
                </div>
                <span className={`status-pill ${getStatusClassName(booking.status)}`}>{booking.status}</span>
              </div>

              <div className="booking-meta">
                <span>{new Date(booking.date).toLocaleDateString()}</span>
                <span>{booking.guests} guests</span>
                <span>{booking.name}</span>
                <span>{booking.food}</span>
              </div>

              {booking.requests ? (
                <p className="section-description" style={{ marginTop: "14px" }}>{booking.requests}</p>
              ) : null}
            </article>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;
