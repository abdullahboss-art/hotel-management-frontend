import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate, Link } from "react-router-dom";

const Booking = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [guestName, setGuestName] = useState("");
  const [bookingData, setBookingData] = useState({
    checkInDate: "",
    checkOutDate: "",
    numberOfGuests: 1,
    specialRequests: "",
  });

  // Check if user is logged in
  const token = localStorage.getItem("token");

  useEffect(() => {
    console.log("Booking page loaded for room ID:", id);
    console.log("Token exists:", !!token);

    // Redirect if not logged in
    if (!token) {
      console.log("No token found, redirecting to login");
      navigate("/login", { state: { from: `/booking/${id}` } });
      return;
    }

    // GET GUEST DATA FROM LOCALSTORAGE
    const getGuestData = () => {
      try {
        // Try different keys where guest data might be stored
        const possibleKeys = ["guest", "user", "userData", "currentUser", "profile"];

        for (const key of possibleKeys) {
          const data = localStorage.getItem(key);
          if (data) {
            try {
              const parsed = JSON.parse(data);
              if (parsed && (parsed.name || parsed.firstName || parsed.fullName)) {
                const name = parsed.name || parsed.firstName || parsed.fullName || "Guest";
                setGuestName(name);
                console.log(`✅ Guest name found in ${key}:`, name);
                break;
              }
            } catch (err) {
              console.error("Error parsing guest data:", err);
            }
          }
        }
      } catch (err) {
        console.error("Error getting guest data:", err);
      }
    };

    getGuestData();

    const fetchRoomDetails = async () => {
      try {
        setLoading(true);
        console.log("Fetching room details for ID:", id);

        const res = await axios.get(`http://localhost:5000/rooms/${id}`);
        console.log("Room details response:", res.data);

        if (res.data && res.data.data) {
          setRoom(res.data.data);
        } else if (res.data) {
          setRoom(res.data);
        } else {
          setError("No room data found");
        }
      } catch (err) {
        console.error("Fetch Room Error:", err);
        setError("Failed to fetch room details. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchRoomDetails();
  }, [id, token, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setBookingData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const calculateNights = () => {
    if (!bookingData.checkInDate || !bookingData.checkOutDate) return 0;
    const start = new Date(bookingData.checkInDate);
    const end = new Date(bookingData.checkOutDate);
    const nights = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    return nights > 0 ? nights : 0;
  };

  const calculateTotal = () => {
    if (!bookingData.checkInDate || !bookingData.checkOutDate || !room) return 0;
    const nights = calculateNights();
    return nights * (room.pricing?.pricePerNight || 0);
  };

  const validateDates = () => {
    if (!bookingData.checkInDate || !bookingData.checkOutDate) return true;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const checkIn = new Date(bookingData.checkInDate);
    const checkOut = new Date(bookingData.checkOutDate);

    if (checkIn < today) {
      alert("Check-in date cannot be in the past");
      return false;
    }

    if (checkOut <= checkIn) {
      alert("Check-out date must be after check-in date");
      return false;
    }

    return true;
  };

  const getGuestId = () => {
    try {
      // Try different keys where guest ID might be stored
      const possibleKeys = ["guest", "user", "userData", "currentUser", "profile"];

      for (const key of possibleKeys) {
        const data = localStorage.getItem(key);
        if (data) {
          try {
            const parsed = JSON.parse(data);
            const guestId = parsed._id || parsed.id || parsed.userId;
            if (guestId) {
              console.log(`✅ Guest ID found in ${key}:`, guestId);
              return guestId;
            }
          } catch (err) {
            console.error("Error parsing guest id:", err);
          }
        }
      }

      // Try to get from token as last resort
      if (token) {
        try {
          const base64Url = token.split(".")[1];
          const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
          const payload = JSON.parse(atob(base64));
          return payload._id || payload.id;
        } catch (e) {
          console.error("Error decoding token:", e);
        }
      }
    } catch (err) {
      console.error("Error getting guest ID:", err);
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!token) {
      navigate("/login", { state: { from: `/booking/${id}` } });
      return;
    }

    if (!validateDates()) {
      return;
    }

    const guestId = getGuestId();

    if (!guestId) {
      alert("Guest information not found. Please login again.");
      navigate("/login");
      return;
    }

    if (!window.confirm("Are you sure you want to confirm this booking?")) {
      return;
    }

    try {
      setSubmitting(true);

      const nights = calculateNights();
      const totalAmount = calculateTotal();

      if (nights <= 0) {
        alert("Please select valid dates");
        setSubmitting(false);
        return;
      }

      const roomId = room.id || room._id;

      const bookingPayload = {
        guestId: guestId,
        roomId: roomId,
        checkInDate: bookingData.checkInDate,
        checkOutDate: bookingData.checkOutDate,
        numberOfGuests: parseInt(bookingData.numberOfGuests),
        specialRequests: bookingData.specialRequests || "",
        status: "reserved",
        totalAmount: totalAmount,
        paymentStatus: "pending",
      };

      console.log("Sending booking payload:", bookingPayload);

      const response = await axios.post(
        "http://localhost:5000/booking/addbooking",
        bookingPayload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Booking response:", response.data);
      alert("Booking confirmed successfully!");

      const bookingTimer = {
        roomId: roomId,
        expiryTime: Date.now() + 10 * 60 * 1000, // 10 minutes
      };
      localStorage.setItem(`booking_${roomId}`, JSON.stringify(bookingTimer));

      navigate("/rooms");
    } catch (err) {
      console.error("Booking Error:", err);
      const errorMessage = err.response?.data?.message || err.message || "Booking failed. Please try again.";
      alert("Booking failed: " + errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const getRoomImage = (room) => {
    if (room?.image) {
      return `http://localhost:5000${room.image}`;
    }
    return "/images/default-room.jpg";
  };

  const themeStyle = `
    :root {
      --sg-bg: #0d0f14;
      --sg-bg-soft: #12151c;
      --sg-card: #171b23;
      --sg-border: #262b35;
      --sg-text: #f4f1ea;
      --sg-text-muted: #a7a9b3;
      --sg-gold: #e8a33e;
      --sg-gold-light: #ffcf85;
    }

    .bk-page {
      background: var(--sg-bg);
      color: var(--sg-text);
      font-family: "Poppins", "Segoe UI", sans-serif;
      min-height: 100vh;
    }

    .bk-hero {
      position: relative;
      min-height: 320px;
      display: flex;
      align-items: center;
      justify-content: center;
      text-align: center;
      background: linear-gradient(rgba(13,15,20,0.72), rgba(13,15,20,0.88)),
        url("/images/hero_4.jpg") center / cover no-repeat;
      padding: 60px 24px;
    }

    .bk-eyebrow {
      display: block;
      color: var(--sg-gold-light);
      font-size: 12.5px;
      font-weight: 700;
      letter-spacing: 0.22em;
      text-transform: uppercase;
      margin-bottom: 14px;
    }

    .bk-hero h1 {
      margin: 0 0 16px;
      color: #fff;
      font-family: "Playfair Display", Georgia, serif;
      font-size: clamp(30px, 4vw, 44px);
      font-weight: 700;
    }

    .bk-welcome {
      display: inline-block;
      margin-bottom: 14px;
      padding: 8px 18px;
      border-radius: 30px;
      background: rgba(232,163,62,0.14);
      border: 1px solid rgba(232,163,62,0.35);
      color: var(--sg-gold-light);
      font-size: 13.5px;
    }

    .bk-breadcrumb {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      color: var(--sg-text-muted);
      font-size: 13.5px;
      list-style: none;
      margin: 0;
      padding: 0;
    }

    .bk-breadcrumb a { color: var(--sg-gold-light); text-decoration: none; }
    .bk-breadcrumb a:hover { color: #fff; }

    .bk-container { max-width: 1180px; margin: 0 auto; padding: 60px 24px 90px; }

    .bk-layout { display: grid; grid-template-columns: 400px 1fr; gap: 30px; align-items: start; }

    .bk-card {
      background: var(--sg-card);
      border: 1px solid var(--sg-border);
      border-radius: 14px;
      overflow: hidden;
    }

    .bk-room-image { height: 260px; overflow: hidden; background: var(--sg-bg-soft); }
    .bk-room-image img { width: 100%; height: 100%; object-fit: cover; display: block; }

    .bk-room-body { padding: 22px; }

    .bk-room-title {
      margin: 0 0 16px;
      color: #fff;
      font-family: "Playfair Display", Georgia, serif;
      font-size: 20px;
      font-weight: 700;
    }

    .bk-detail-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px 0;
      border-bottom: 1px solid var(--sg-border);
      font-size: 13.5px;
    }
    .bk-detail-row:last-of-type { border-bottom: none; }
    .bk-detail-label { color: var(--sg-text-muted); }
    .bk-detail-value { color: var(--sg-text); font-weight: 600; }
    .bk-price-value { color: var(--sg-gold); font-weight: 700; font-size: 15px; }

    .bk-badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 11.5px;
      font-weight: 700;
      text-transform: capitalize;
    }
    .bk-badge.available { background: rgba(74,222,128,0.14); color: #4ade80; }
    .bk-badge.occupied { background: rgba(255,107,107,0.14); color: #ff6b6b; }
    .bk-badge.other { background: rgba(232,163,62,0.14); color: var(--sg-gold-light); }

    .bk-description {
      margin-top: 16px;
      padding-top: 16px;
      border-top: 1px solid var(--sg-border);
    }
    .bk-description strong { color: #fff; font-size: 13.5px; }
    .bk-description p { color: var(--sg-text-muted); font-size: 13.5px; line-height: 1.7; margin: 8px 0 0; }

    .bk-form-body { padding: 26px; }

    .bk-form-title {
      margin: 0 0 20px;
      color: #fff;
      font-family: "Playfair Display", Georgia, serif;
      font-size: 22px;
      font-weight: 700;
    }

    .bk-form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; }
    .bk-field { display: flex; flex-direction: column; gap: 8px; }
    .bk-field.full { grid-column: 1 / -1; }

    .bk-field label { color: var(--sg-text-muted); font-size: 12.5px; font-weight: 600; }

    .bk-field input,
    .bk-field select,
    .bk-field textarea {
      width: 100%;
      padding: 12px 14px;
      border: 1px solid var(--sg-border);
      border-radius: 8px;
      background: var(--sg-bg);
      color: var(--sg-text);
      font-size: 13.5px;
      outline: none;
      box-sizing: border-box;
      color-scheme: dark;
      font-family: inherit;
    }
    .bk-field input:focus,
    .bk-field select:focus,
    .bk-field textarea:focus { border-color: var(--sg-gold); }
    .bk-field input:disabled { opacity: 0.6; }
    .bk-field textarea { resize: vertical; }

    .bk-summary {
      grid-column: 1 / -1;
      background: rgba(232,163,62,0.08);
      border: 1px solid rgba(232,163,62,0.3);
      border-radius: 10px;
      padding: 18px 20px;
    }
    .bk-summary h5 {
      margin: 0 0 12px;
      color: var(--sg-gold-light);
      font-family: "Playfair Display", Georgia, serif;
      font-size: 16px;
    }
    .bk-summary hr { border: none; border-top: 1px solid var(--sg-border); margin: 12px 0; }
    .bk-summary p { margin: 0 0 6px; color: var(--sg-text-muted); font-size: 13.5px; }
    .bk-summary p strong { color: var(--sg-text); }
    .bk-summary .bk-total { color: #fff; font-size: 19px; font-weight: 700; margin: 0; }
    .bk-summary .bk-total span { color: var(--sg-gold); }
    .bk-summary small { color: var(--sg-text-muted); font-size: 12px; }

    .bk-warning {
      grid-column: 1 / -1;
      background: rgba(251,146,60,0.12);
      border: 1px solid rgba(251,146,60,0.3);
      border-radius: 8px;
      padding: 12px 16px;
      color: #fb923c;
      font-size: 13.5px;
    }

    .bk-actions { grid-column: 1 / -1; display: flex; flex-direction: column; gap: 10px; margin-top: 4px; }

    .bk-btn-primary {
      width: 100%;
      padding: 14px;
      border: none;
      border-radius: 8px;
      background: linear-gradient(135deg, var(--sg-gold-light), var(--sg-gold));
      color: #2b2417;
      font-size: 15px;
      font-weight: 700;
      cursor: pointer;
      transition: transform 0.2s ease;
    }
    .bk-btn-primary:hover:not(:disabled) { transform: translateY(-1px); }
    .bk-btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }

    .bk-btn-secondary {
      width: 100%;
      padding: 13px;
      border: 1px solid var(--sg-border);
      border-radius: 8px;
      background: transparent;
      color: var(--sg-text-muted);
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    .bk-btn-secondary:hover { border-color: var(--sg-gold); color: var(--sg-gold-light); }

    .bk-state-section { padding: 120px 24px; text-align: center; }
    .bk-spinner {
      width: 40px; height: 40px; margin: 0 auto 16px;
      border: 3px solid var(--sg-border);
      border-top-color: var(--sg-gold);
      border-radius: 50%;
      animation: bk-spin 0.8s linear infinite;
    }
    @keyframes bk-spin { to { transform: rotate(360deg); } }
    .bk-state-text { color: var(--sg-text-muted); font-size: 14px; }
    .bk-alert-error {
      max-width: 480px; margin: 0 auto 18px; padding: 14px 18px;
      border-radius: 8px; background: rgba(255,107,107,0.12);
      border: 1px solid rgba(255,107,107,0.3); color: #ff6b6b; font-size: 14px;
    }

    @media (max-width: 900px) {
      .bk-layout { grid-template-columns: 1fr; }
      .bk-form-grid { grid-template-columns: 1fr; }
    }
  `;

  if (loading) {
    return (
      <div className="bk-page">
        <style>{themeStyle}</style>
        <section className="bk-state-section">
          <div className="bk-spinner" />
          <p className="bk-state-text">Loading room details...</p>
        </section>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bk-page">
        <style>{themeStyle}</style>
        <section className="bk-state-section">
          <div className="bk-alert-error">{error}</div>
          <button className="bk-btn-primary" style={{ maxWidth: 220, margin: "0 auto" }} onClick={() => navigate("/rooms")}>
            Back to Rooms
          </button>
        </section>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="bk-page">
        <style>{themeStyle}</style>
        <section className="bk-state-section">
          <div className="bk-alert-error">Room not found!</div>
          <button className="bk-btn-primary" style={{ maxWidth: 220, margin: "0 auto" }} onClick={() => navigate("/rooms")}>
            Back to Rooms
          </button>
        </section>
      </div>
    );
  }

  const nights = calculateNights();
  const totalAmount = calculateTotal();
  const statusClass =
    room.status === "available" ? "available" : room.status === "occupied" ? "occupied" : "other";

  return (
    <div className="bk-page">
      <style>{themeStyle}</style>

      {/* =============== HERO =============== */}
      <section className="bk-hero">
        <div>
          <span className="bk-eyebrow">Reservation</span>
          <h1>Book Your Room</h1>

          {guestName && (
            <div className="bk-welcome">
              Welcome, <strong>{guestName}</strong>!
            </div>
          )}

          <ul className="bk-breadcrumb">
            <li><Link to="/">Home</Link></li>
            <li>•</li>
            <li><Link to="/rooms">Rooms</Link></li>
            <li>•</li>
            <li>Booking</li>
          </ul>
        </div>
      </section>

      {/* =============== CONTENT =============== */}
      <section className="bk-container">
        <div className="bk-layout">

          {/* ROOM SUMMARY */}
          <div className="bk-card">
            <div className="bk-room-image">
              <img
                src={getRoomImage(room)}
                alt={`Room ${room.roomNumber}`}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "/images/default-room.jpg";
                }}
              />
            </div>

            <div className="bk-room-body">
              <h3 className="bk-room-title">
                Room {room.roomNumber} —{" "}
                {room.roomType?.charAt(0).toUpperCase() + room.roomType?.slice(1) || "Suite"}
              </h3>

              <div className="bk-detail-row">
                <span className="bk-detail-label">Price</span>
                <span className="bk-price-value">${room.pricing?.pricePerNight || 0} / night</span>
              </div>

              <div className="bk-detail-row">
                <span className="bk-detail-label">Status</span>
                <span className={`bk-badge ${statusClass}`}>{room.status || "available"}</span>
              </div>

              <div className="bk-detail-row">
                <span className="bk-detail-label">View</span>
                <span className="bk-detail-value">{room.features?.view || "City"}</span>
              </div>

              <div className="bk-detail-row">
                <span className="bk-detail-label">Size</span>
                <span className="bk-detail-value">{room.features?.size || 0} sqm</span>
              </div>

              <div className="bk-detail-row">
                <span className="bk-detail-label">Balcony</span>
                <span className="bk-detail-value">{room.features?.balcony ? "Yes" : "No"}</span>
              </div>

              <div className="bk-detail-row">
                <span className="bk-detail-label">Floor</span>
                <span className="bk-detail-value">{room.floor || 1}</span>
              </div>

              {room.description && (
                <div className="bk-description">
                  <strong>Description</strong>
                  <p>{room.description}</p>
                </div>
              )}
            </div>
          </div>

          {/* BOOKING FORM */}
          <div className="bk-card">
            <div className="bk-form-body">
              <h3 className="bk-form-title">Booking Details</h3>

              {guestName && (
                <div className="bk-welcome" style={{ display: "block", marginBottom: 20 }}>
                  Booking for: <strong>{guestName}</strong>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="bk-form-grid">
                  <div className="bk-field">
                    <label>Check In Date *</label>
                    <input
                      type="date"
                      name="checkInDate"
                      value={bookingData.checkInDate}
                      onChange={handleChange}
                      min={new Date().toISOString().split("T")[0]}
                      required
                    />
                  </div>

                  <div className="bk-field">
                    <label>Check Out Date *</label>
                    <input
                      type="date"
                      name="checkOutDate"
                      value={bookingData.checkOutDate}
                      onChange={handleChange}
                      min={bookingData.checkInDate || new Date().toISOString().split("T")[0]}
                      required
                    />
                  </div>

                  <div className="bk-field">
                    <label>Number of Guests *</label>
                    <select
                      name="numberOfGuests"
                      value={bookingData.numberOfGuests}
                      onChange={handleChange}
                      required
                    >
                      {[1, 2, 3, 4, 5, 6].map((num) => (
                        <option key={num} value={num}>
                          {num} {num === 1 ? "Guest" : "Guests"}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="bk-field">
                    <label>Room Number</label>
                    <input type="text" value={room.roomNumber} disabled readOnly />
                  </div>

                  <div className="bk-field full">
                    <label>Special Requests (Optional)</label>
                    <textarea
                      name="specialRequests"
                      rows="3"
                      value={bookingData.specialRequests}
                      onChange={handleChange}
                      placeholder="Any special requests? (e.g., extra pillows, late check-in, etc.)"
                    />
                  </div>

                  {bookingData.checkInDate && bookingData.checkOutDate && nights > 0 && (
                    <div className="bk-summary">
                      <h5>Price Summary</h5>
                      <hr />
                      <p><strong>Room:</strong> {room.roomNumber} ({room.roomType})</p>
                      <p><strong>Check In:</strong> {new Date(bookingData.checkInDate).toLocaleDateString()}</p>
                      <p><strong>Check Out:</strong> {new Date(bookingData.checkOutDate).toLocaleDateString()}</p>
                      <p><strong>Nights:</strong> {nights}</p>
                      <p><strong>Price per night:</strong> ${room.pricing?.pricePerNight || 0}</p>
                      <p><strong>Guests:</strong> {bookingData.numberOfGuests}</p>
                      <hr />
                      <p className="bk-total">
                        Total Amount: <span>${totalAmount}</span>
                      </p>
                      <small>Payment Status: Pending</small>
                    </div>
                  )}

                  {bookingData.checkInDate && bookingData.checkOutDate && nights <= 0 && (
                    <div className="bk-warning">
                      Please select valid dates (check-out must be after check-in)
                    </div>
                  )}

                  <div className="bk-actions">
                    <button type="submit" className="bk-btn-primary" disabled={submitting || nights <= 0}>
                      {submitting ? "Processing..." : "Confirm Booking"}
                    </button>

                    <button type="button" className="bk-btn-secondary" onClick={() => navigate("/rooms")}>
                      Cancel
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Booking;