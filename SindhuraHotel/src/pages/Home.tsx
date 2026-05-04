import { useNavigate } from "react-router-dom";
import hall1 from "../assets/hall1.jpg";

const halls = [
  {
    id: 1,
    name: "3rd Floor",
    description: "Perfect for small gatherings and corporate meetings with intimate seating and warm hospitality.",
    image: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=1200&q=80",
    capacity: "Capacity 60"
  },
  {
    id: 2,
    name: "4th Floor",
    description: "Ideal for weddings and large celebrations with a grand setting built for memorable evenings.",
    image: hall1,
    capacity: "Capacity 200"
  },
  {
    id: 3,
    name: "5th Floor",
    description: "A luxury venue for stylish mid-sized events, premium dinners, and curated family functions.",
    image: "https://images.unsplash.com/photo-1505236858219-8359eb29e329?w=1200&q=80",
    capacity: "Capacity 100"
  }
];

const Home = () => {
  const navigate = useNavigate();

  const handleBook = () => {
    const token = localStorage.getItem("token");
    navigate(token ? "/booking" : "/login");
  };

  return (
    <div className="page-shell">
      <section
        className="hero"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1519741497674-611481863552?w=1800&q=80')"
        }}
      >
        <div className="hero-grid">
          <div className="hero-content">
            <div className="eyebrow">Luxury Event Destination</div>
            <h1 className="hero-title">Host Your Perfect Event in Style</h1>
            <p className="hero-description">
              Experience understated opulence and seamless service across our signature banquet floors,
              curated for weddings, receptions, and unforgettable private occasions.
            </p>
            <div className="hero-actions">
              <button className="primary-button" onClick={handleBook}>
                Book Now
              </button>
              <a href="#venues" className="secondary-button">
                Explore Halls
              </a>
            </div>
          </div>

          <div className="hero-watermark">
            <div>
              <div className="hero-monogram">HSE</div>
              <div className="hero-brand">Hotel Sindhura East Court</div>
            </div>
          </div>
        </div>
      </section>

      <section className="section-block" id="venues">
        <div className="section-header">
          <div>
            <div className="eyebrow" style={{ color: "var(--gold)" }}>Our Venues</div>
            <h2 className="section-title">Exclusive Spaces</h2>
            <p className="section-description">
              Each floor offers a distinct atmosphere and capacity while carrying the same HSE signature finish.
            </p>
          </div>
        </div>

        <div className="venue-grid">
          {halls.map((hall) => (
            <article key={hall.id} className="venue-card">
              <div className="venue-image-wrap">
                <img src={hall.image} alt={hall.name} />
                <div className="venue-capacity">{hall.capacity}</div>
              </div>

              <div className="venue-body">
                <h3 className="venue-title">{hall.name}</h3>
                <p className="venue-description">{hall.description}</p>
                <button className="ghost-button" onClick={handleBook}>
                  Book This Hall
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <div className="footer-spacer">
        Crafted for premium celebrations at Hotel Sindhura East Court.
      </div>
    </div>
  );
};

export default Home;
