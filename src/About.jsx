import React from "react";
import { Link } from "react-router-dom";
import "./About.css";

const About = () => {
  const features = [
    {
      icon: "🛏️",
      title: "Comfortable Stay",
      text: "Clean and comfortable rooms designed to help you relax and enjoy your stay.",
    },
    {
      icon: "📅",
      title: "Easy Booking",
      text: "Explore available rooms and make your reservation through our easy online booking system.",
    },
    {
      icon: "🎧",
      title: "Professional Service",
      text: "Our team is committed to providing friendly and professional service throughout your stay.",
    },
  ];

  const stats = [
    { value: "50+", label: "Rooms" },
    { value: "1000+", label: "Happy Guests" },
    { value: "24/7", label: "Guest Support" },
    { value: "4.8", label: "Guest Rating" },
  ];

  const facilities = [
    { icon: "📶", title: "Free Wi-Fi", text: "Stay connected with fast and reliable Wi-Fi throughout the hotel." },
    { icon: "🛏️", title: "Comfortable Rooms", text: "Enjoy clean, comfortable and beautifully designed rooms." },
    { icon: "🍽️", title: "Restaurant", text: "Enjoy delicious meals and refreshments in our dining area." },
    { icon: "🛎️", title: "Room Service", text: "Our team is available to make your stay comfortable." },
    { icon: "🅿️", title: "Parking", text: "Convenient parking facilities are available for our guests." },
    { icon: "🎧", title: "24/7 Support", text: "Our staff is ready to assist you whenever you need us." },
  ];

  const timeline = [
    {
      year: "2024",
      title: "Our Beginning",
      text: "We started with a vision to provide guests with comfortable accommodation and quality hospitality.",
    },
    {
      year: "2025",
      title: "Growing Guest Experience",
      text: "We continued improving our rooms, services and guest experience.",
    },
    {
      year: "2026",
      title: "Smart Hotel Management",
      text: "Our modern hotel management system helps manage rooms, reservations, guests and housekeeping more efficiently.",
    },
  ];

  return (
    <div className="about-page">

      {/* =============== HERO =============== */}
      <section className="about-hero">
        <div className="about-hero-overlay" />

        <div className="about-container">
          <div className="about-hero-content">
            <span className="about-eyebrow">Premium Hotel &amp; Resort</span>

            <h1>About Our Hotel</h1>

            <div className="about-breadcrumb">
              <Link to="/">Home</Link>
              <span>/</span>
              <span>About</span>
            </div>

            <p>
              Comfort, convenience and quality hospitality — all in one
              place.
            </p>
          </div>
        </div>
      </section>

      {/* =============== INTRODUCTION =============== */}
      <section className="about-section">
        <div className="about-container">
          <div className="about-intro-grid">
            <div className="about-images">
              <div className="about-main-image">
                <img src="/images/img_1.jpg" alt="Comfortable Hotel" />
              </div>

              <div className="about-small-image">
                <img src="/images/LuxeryRoom.jpg" alt="Luxury Room" />
              </div>
            </div>

            <div className="about-intro-content">
              <span className="about-section-label">Who We Are</span>

              <h2>
                Welcome to <span>Our Hotel</span>
              </h2>

              <p>
                Welcome to our hotel, where comfort, convenience and quality
                service come together to create a memorable stay.
              </p>

              <p>
                Our goal is to provide every guest with a comfortable
                environment, well-maintained rooms and professional service.
              </p>

              <p>
                Whether you are travelling for business, enjoying a family
                vacation or planning a relaxing getaway, we are here to make
                your stay enjoyable.
              </p>

              <Link to="/Rooms" className="about-primary-button">
                Explore Rooms
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* =============== WHY CHOOSE US =============== */}
      <section className="about-section about-soft-section">
        <div className="about-container">
          <div className="about-section-heading">
            <h2>Why Choose Us</h2>
            <p>
              Everything you need for a comfortable and convenient hotel
              experience.
            </p>
          </div>

          <div className="about-feature-grid">
            {features.map((feature) => (
              <div className="about-feature-card" key={feature.title}>
                <div className="about-feature-icon">{feature.icon}</div>
                <h3>{feature.title}</h3>
                <p>{feature.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =============== STATISTICS =============== */}
      <section className="about-stats-section">
        <div className="about-stats-overlay" />

        <div className="about-container">
          <div className="about-stats-grid">
            {stats.map((stat) => (
              <div className="about-stat-card" key={stat.label}>
                <h2>{stat.value}</h2>
                <p>{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =============== FACILITIES =============== */}
      <section className="about-section">
        <div className="about-container">
          <div className="about-section-heading">
            <h2>Our Facilities</h2>
            <p>
              We provide essential facilities to make your stay comfortable
              and enjoyable.
            </p>
          </div>

          <div className="about-facility-grid">
            {facilities.map((facility) => (
              <div className="about-facility-card" key={facility.title}>
                <div className="about-facility-icon">{facility.icon}</div>
                <div className="about-facility-content">
                  <h3>{facility.title}</h3>
                  <p>{facility.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =============== OUR JOURNEY =============== */}
      <section className="about-section about-soft-section">
        <div className="about-container">
          <div className="about-section-heading">
            <h2>Our Journey</h2>
            <p>
              A simple journey focused on better hospitality and a better
              guest experience.
            </p>
          </div>

          <div className="about-timeline">
            {timeline.map((item) => (
              <div className="about-timeline-item" key={item.year}>
                <div className="about-timeline-content">
                  <div className="about-timeline-year">{item.year}</div>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =============== FINAL CTA =============== */}
      <section className="about-cta-section">
        <div className="about-cta-overlay" />

        <div className="about-container">
          <div className="about-cta-content">
            <h2>Your Comfortable Stay Starts Here</h2>

            <p>
              Explore our rooms and find the perfect place for your next
              stay.
            </p>

            <div className="about-cta-buttons">
              <Link to="/Rooms" className="about-secondary-button">
                Explore Rooms
              </Link>

              <Link to="/Reservation" className="about-primary-button">
                Book Now
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default About;