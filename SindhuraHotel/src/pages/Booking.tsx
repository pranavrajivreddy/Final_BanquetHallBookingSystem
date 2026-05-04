import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ApiError, apiRequest, getAuthToken } from "../lib/api";

type BookingFormData = {
  id?: number;
  name: string;
  date: string;
  eventType: string;
  decoration: string;
  food: string;
  guests: string;
  requests: string;
  status?: string;
};

const Booking = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [eventType, setEventType] = useState("");
  const [decoration, setDecoration] = useState("");
  const [food, setFood] = useState("");
  const [guests, setGuests] = useState("");
  const [requests, setRequests] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!getAuthToken()) {
      navigate("/login", { replace: true });
    }
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!getAuthToken()) {
      return;
    }

    const booking: BookingFormData = {
      name,
      date,
      eventType,
      decoration,
      food,
      guests,
      requests
    };

    try {
      setIsSubmitting(true);
      const data = await apiRequest<{ booking: BookingFormData }>("/bookings", {
        method: "POST",
        body: JSON.stringify(booking)
      }, true);

      const submittedBooking = {
        ...data.booking,
        guests: String(data.booking.guests)
      };
      sessionStorage.setItem("latestBooking", JSON.stringify(submittedBooking));
      navigate("/booking-success", { state: submittedBooking });
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "Server error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAdvancePayment = () => {
    alert("Advance payment successful! (Simulation)");
  };

  return (
    <div className="page-shell">
      <div className="section-block">
        <div className="page-grid">
          <section className="panel-card form-panel">
            <div className="eyebrow" style={{ color: "var(--gold)" }}>Reservation Form</div>
            <h1 className="section-title">Reserve a Banquet Experience</h1>
            <p className="section-description">
              Share the core event details and our team will begin reviewing your request immediately.
            </p>

            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div>
                  <label className="label">Customer Name</label>
                  <input className="text-input" value={name} onChange={(e) => setName(e.target.value)} required />
                </div>
                <div>
                  <label className="label">Event Date</label>
                  <input className="text-input" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
                </div>
                <div>
                  <label className="label">Event Type</label>
                  <input className="text-input" value={eventType} onChange={(e) => setEventType(e.target.value)} required />
                </div>
                <div>
                  <label className="label">Decoration</label>
                  <select className="select-input" value={decoration} onChange={(e) => setDecoration(e.target.value)} required>
                    <option value="">Select decoration preference</option>
                    <option value="hotel">Decoration by Hotel</option>
                    <option value="own">Own Decoration</option>
                  </select>
                </div>
                <div>
                  <label className="label">Food Preference</label>
                  <select className="select-input" value={food} onChange={(e) => setFood(e.target.value)} required>
                    <option value="">Select food preference</option>
                    <option value="veg">Veg</option>
                    <option value="nonveg">Non Veg</option>
                    <option value="both">Both</option>
                  </select>
                </div>
                <div>
                  <label className="label">Estimated Guests</label>
                  <input className="text-input" type="number" min="1" value={guests} onChange={(e) => setGuests(e.target.value)} required />
                </div>
                <div className="full-span">
                  <label className="label">Additional Notes</label>
                  <textarea className="text-area" value={requests} onChange={(e) => setRequests(e.target.value)} />
                </div>
              </div>

              <div className="action-row">
                <button type="button" className="ghost-button" onClick={handleAdvancePayment}>
                  Pay Advance
                </button>
                <button type="submit" className="primary-button" disabled={isSubmitting}>
                  {isSubmitting ? "Submitting..." : "Submit Booking Request"}
                </button>
              </div>
            </form>
          </section>

          <aside className="info-stack">
            <div className="info-card dark">
              <div className="info-kicker">HSE Promise</div>
              <h3 className="info-title">A White-Glove Planning Experience</h3>
              <p className="info-copy">
                Once submitted, your request is reviewed by our admin team for availability, setup preferences, and final confirmation.
              </p>
            </div>
            <div className="info-card">
              <div className="info-kicker">What Happens Next</div>
              <h3 className="info-title">Track Every Update</h3>
              <p className="info-copy">
                You will see the request status in your dashboard, receive approval updates, and coordinate final event details through HSE.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default Booking;
