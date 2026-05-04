import { useLocation, useNavigate } from "react-router-dom";

type BookingDetails = {
  id?: number;
  name: string;
  date: string;
  eventType: string;
  decoration: string;
  food: string;
  guests: string | number;
  requests: string;
  status?: string;
};

const BookingSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const booking =
    (location.state as BookingDetails | null) ||
    JSON.parse(sessionStorage.getItem("latestBooking") || "null");

  if (!booking) {
    return (
      <div className="success-shell">
        <div className="success-card">
          <h2 className="section-title">No booking data found</h2>
          <div className="action-row" style={{ justifyContent: "center" }}>
            <button className="primary-button" onClick={() => navigate("/")}>
              Go Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="success-shell">
      <section className="success-card">
        <div className="success-icon">✓</div>
        <h1 className="success-title">Booking Submitted Successfully</h1>
        <p className="success-description">
          Your request has been received and is now under review by the HSE admin team. We will notify you once it is confirmed.
        </p>

        <div className="detail-card">
          <div className="detail-card-header">
            <div>
              <div className="detail-item-label">Event Details</div>
              <div className="detail-item-value" style={{ fontSize: "1.35rem" }}>{booking.eventType}</div>
            </div>
            <span className="status-pill status-pending">{booking.status || "Pending"}</span>
          </div>

          <div className="detail-card-grid">
            <div>
              <div className="detail-item-label">Customer Name</div>
              <div className="detail-item-value">{booking.name}</div>
            </div>
            <div>
              <div className="detail-item-label">Date</div>
              <div className="detail-item-value">{new Date(booking.date).toLocaleDateString()}</div>
            </div>
            <div>
              <div className="detail-item-label">Guests</div>
              <div className="detail-item-value">{booking.guests}</div>
            </div>
            <div>
              <div className="detail-item-label">Food Preference</div>
              <div className="detail-item-value">{booking.food}</div>
            </div>
            <div>
              <div className="detail-item-label">Decoration</div>
              <div className="detail-item-value">{booking.decoration}</div>
            </div>
            <div>
              <div className="detail-item-label">Booking ID</div>
              <div className="detail-item-value">{booking.id ? `#${booking.id}` : "Will be assigned shortly"}</div>
            </div>
            <div style={{ gridColumn: "1 / -1" }}>
              <div className="detail-item-label">Additional Notes</div>
              <div className="detail-item-value">{booking.requests || "No additional requests submitted."}</div>
            </div>
          </div>
        </div>

        <div className="action-row" style={{ justifyContent: "center" }}>
          <button className="ghost-button" onClick={() => navigate("/customer-dashboard")}>
            Go to Dashboard
          </button>
          <button className="primary-button" onClick={() => navigate("/")}>
            Back to Home
          </button>
        </div>
      </section>
    </div>
  );
};

export default BookingSuccess;
