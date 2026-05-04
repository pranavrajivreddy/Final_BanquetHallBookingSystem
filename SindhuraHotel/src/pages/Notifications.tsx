import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ApiError, apiRequest, getAuthToken } from "../lib/api";

type BookingNotification = {
  id: number;
  eventType: string;
  date: string;
  status: "Pending" | "Approved" | "Rejected";
};

const getStatusClassName = (status: BookingNotification["status"]) => {
  if (status === "Approved") {
    return "status-approved";
  }

  if (status === "Rejected") {
    return "status-rejected";
  }

  return "status-pending";
};

const Notifications = () => {
  const [bookings, setBookings] = useState<BookingNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const loadNotifications = async () => {
      if (!getAuthToken()) {
        navigate("/login", { replace: true });
        return;
      }

      try {
        setIsLoading(true);
        setError("");
        const data = await apiRequest<{ bookings: BookingNotification[] }>("/bookings", {}, true);
        setBookings(data.bookings);
      } catch (err) {
        setError(err instanceof ApiError ? err.message : "Unable to load notifications");
      } finally {
        setIsLoading(false);
      }
    };

    loadNotifications();
  }, [navigate]);

  return (
    <div className="page-shell">
      <section className="section-block">
        <div className="section-header">
          <div>
            <div className="eyebrow" style={{ color: "var(--gold)" }}>Live Updates</div>
            <h1 className="section-title">Notifications</h1>
            <p className="section-description">
              Stay updated on the approval status of every reservation request you have submitted.
            </p>
          </div>
        </div>

        {isLoading && <p className="muted-copy">Loading notifications...</p>}
        {error && <p className="error-copy">{error}</p>}
        {!isLoading && !error && bookings.length === 0 && (
          <p className="empty-copy">No booking updates yet.</p>
        )}

        <div className="notification-grid">
          {bookings.map((booking) => (
            <article key={booking.id} className="timeline-card">
              <div className="detail-item-label">Booking Update</div>
              <p>
                Your booking for <strong>{booking.eventType}</strong> on{" "}
                <strong>{new Date(booking.date).toLocaleDateString()}</strong> is currently{" "}
                <span className={`status-pill ${getStatusClassName(booking.status)}`}>{booking.status}</span>.
              </p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Notifications;
