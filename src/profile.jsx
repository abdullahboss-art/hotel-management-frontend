

import React, { useEffect, useState } from "react";
import axios from "axios";

const Profile = () => {
  const [bookings, setBookings] = useState([]);
  const [amounts, setAmounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  
  const token = localStorage.getItem("token");

  // Get guest ID from localStorage
  const getGuestId = () => {
    try {
      const guestData = localStorage.getItem("guest");
      console.log("Raw guest data:", guestData);
      
      if (!guestData) return null;
      
      const guest = JSON.parse(guestData);
      console.log("Parsed guest:", guest);
      
      return guest._id || guest.id || null;
    } catch (error) {
      console.error("Error parsing guest:", error);
      return null;
    }
  };

  const guestId = getGuestId();
  console.log("Extracted guestId:", guestId);

  // Calculate nights
  const calculateNights = (checkInDate, checkOutDate) => {
    if (!checkInDate || !checkOutDate) return 1;
    try {
      const checkIn = new Date(checkInDate);
      const checkOut = new Date(checkOutDate);
      
      checkIn.setHours(0, 0, 0, 0);
      checkOut.setHours(0, 0, 0, 0);
      
      const diffTime = checkOut - checkIn;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      return diffDays > 0 ? diffDays : 1;
    } catch {
      return 1;
    }
  };

  // Fetch bookings
  const fetchBookings = async () => {
    if (!guestId) {
      setError("Guest not logged in or guest ID missing.");
      setLoading(false);
      return;
    }

    if (!token) {
      setError("Authentication token missing. Please log in again.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");
      console.log("Fetching bookings for guestId:", guestId);
      
      const res = await axios.get(
        `http://localhost:5000/booking/guest/${guestId}`,
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
        }
      );

      console.log("API Response:", res.data);

      const bookingsData = res.data.data || [];
      
      const processedBookings = bookingsData.map(booking => {
        const nights = calculateNights(booking.checkInDate, booking.checkOutDate);
        
        return {
          ...booking,
          nights: nights,
          displayAmount: booking.totalAmount || 212
        };
      });
      
      setBookings(processedBookings);
      
    } catch (err) {
      console.error("Fetch error:", err);
      setError(err.response?.data?.message || "Failed to fetch bookings.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (guestId && token) {
      fetchBookings();
    } else {
      if (!guestId) {
        setError("Please log in to view your bookings.");
      }
      setLoading(false);
    }
  }, [guestId, token]);

  // Handle payment
  const handlePayment = async (bookingId) => {
    const enteredAmount = parseFloat(amounts[bookingId] || 0);

    if (!enteredAmount || enteredAmount <= 0) {
      alert("Please enter a valid amount greater than 0");
      return;
    }

    const booking = bookings.find(b => b._id === bookingId);
    
    if (!booking) {
      alert("Booking not found");
      return;
    }

    console.log("=== PAYMENT ATTEMPT ===");
    console.log("Booking ID:", bookingId);
    console.log("Entered Amount:", enteredAmount);
    console.log("Booking totalAmount:", booking.totalAmount);
    console.log("Booking paymentStatus:", booking.paymentStatus);

    try {
      setPaymentProcessing(true);
      
      const response = await axios.put(
        `http://localhost:5000/booking/pay/${bookingId}`,
        { amount: enteredAmount },
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
        }
      );

      console.log("Payment success:", response.data);
      
      setSuccessMessage(`✅ Payment successful! ${response.data.data?.change ? `Change: $${response.data.data.change}` : ''}`);
      
      setAmounts(prev => ({ ...prev, [bookingId]: '' }));
      await fetchBookings();
      
      setTimeout(() => setSuccessMessage(""), 3000);
      
    } catch (err) {
      console.error("Payment error details:", {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      });

      const errorData = err.response?.data;
      let errorMessage = "Payment failed. ";

      if (errorData) {
        if (errorData.shortBy) {
          errorMessage = `Insufficient amount! Need $${errorData.requiredAmount}, you paid $${errorData.paidAmount}. Short by $${errorData.shortBy}`;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        }
      }

      alert(`❌ ${errorMessage}`);
      
    } finally {
      setPaymentProcessing(false);
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric'
      });
    } catch {
      return "Invalid Date";
    }
  };

  // Debug function
  const debugBooking = (booking) => {
    console.log("=== DEBUG BOOKING INFO ===");
    console.log("Booking ID:", booking._id);
    console.log("Total Amount:", booking.totalAmount);
    console.log("Payment Status:", booking.paymentStatus);
    console.log("Status:", booking.status);
    console.log("Room ID:", booking.roomId?._id);
    console.log("Room Number:", booking.roomId?.roomNumber);
    console.log("Check-in:", booking.checkInDate);
    console.log("Check-out:", booking.checkOutDate);
    console.log("Nights:", booking.nights);
    console.log("Guest ID:", booking.guestId?._id || booking.guestId);
    console.log("Full booking object:", booking);
    alert("Debug info logged to console. Press F12 to see!");
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("guest");
    window.location.href = "/login";
  };

  if (loading) {
    return (
      <div className="container mt-5">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading your bookings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-5 mb-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">👤 My Profile</h2>
        <button 
          className="btn btn-outline-danger"
          onClick={handleLogout}
        >
          Logout
        </button>
      </div>

      {successMessage && (
        <div className="alert alert-success alert-dismissible fade show" role="alert">
          {successMessage}
          <button 
            type="button" 
            className="btn-close" 
            onClick={() => setSuccessMessage("")}
          ></button>
        </div>
      )}

      {error ? (
        <div className="alert alert-danger" role="alert">
          <h5 className="alert-heading">⚠️ Error</h5>
          <p>{error}</p>
          <hr />
          <button 
            className="btn btn-primary"
            onClick={() => window.location.reload()}
          >
            🔄 Refresh
          </button>
        </div>
      ) : bookings.length === 0 ? (
        <div className="alert alert-info text-center p-4">
          <h4>📅 No Bookings Found</h4>
          <p>You haven't made any bookings yet.</p>
          <button 
            className="btn btn-primary"
            onClick={() => window.location.href = '/rooms'}
          >
            Browse Rooms
          </button>
        </div>
      ) : (
        <>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h4 className="mb-0">📋 My Bookings</h4>
            <span className="badge bg-primary">Total: {bookings.length}</span>
          </div>
          
          <div className="table-responsive">
            <table className="table table-bordered table-hover">
              <thead className="table-dark">
                <tr>
                  <th>Room Details</th>
                  <th>Check In</th>
                  <th>Check Out</th>
                  <th>Nights</th>
                  <th>Total Amount</th>
                  <th>Payment Status</th>
                  <th>Pay Now (Cash)</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking) => {
                  const isPaid = booking.paymentStatus === "paid" || booking.paymentStatus === "complete";
                  const displayAmount = booking.displayAmount || 212;
                  const nights = booking.nights || 1;
                  
                  return (
                    <tr key={booking._id}>
                      <td>
                        <div className="fw-bold">{booking.roomId?.roomNumber || "202"}</div>
                        <div className="text-muted small">{booking.roomId?.roomType || "deluxe"}</div>
                        {booking.roomId?.price && (
                          <div className="text-success small">${booking.roomId.price}/night</div>
                        )}
                      </td>
                      <td>{formatDate(booking.checkInDate)}</td>
                      <td>{formatDate(booking.checkOutDate)}</td>
                      <td className="text-center">
                        <span className="badge bg-info">
                          {nights} {nights === 1 ? 'Night' : 'Nights'}
                        </span>
                      </td>
                      <td className="fw-bold">
                        <span className="text-primary">${displayAmount}</span>
                      </td>
                      <td>
                        <span className={`badge ${isPaid ? "bg-success" : "bg-warning"}`}>
                          {isPaid ? "✅ Paid" : "⏳ Pending"}
                        </span>
                      </td>
                      <td>
                        {!isPaid ? (
                          <div className="d-flex flex-column gap-2" style={{ minWidth: '200px' }}>
                            <button
                              className="btn btn-info btn-sm mb-2"
                              onClick={() => debugBooking(booking)}
                            >
                              🔍 Debug Booking
                            </button>
                            
                            <div className="input-group">
                              <span className="input-group-text">$</span>
                              <input
                                type="number"
                                className="form-control form-control-sm"
                                placeholder="Enter amount"
                                value={amounts[booking._id] || ""}
                                onChange={(e) => setAmounts({
                                  ...amounts,
                                  [booking._id]: e.target.value
                                })}
                                disabled={paymentProcessing}
                              />
                            </div>
                            
                            {displayAmount > 0 && !amounts[booking._id] && (
                              <small className="text-muted">
                                Suggested: ${displayAmount}
                              </small>
                            )}
                            
                            <button
                              className="btn btn-success btn-sm"
                              onClick={() => handlePayment(booking._id)}
                              disabled={!amounts[booking._id] || paymentProcessing}
                            >
                              {paymentProcessing ? (
                                <>
                                  <span className="spinner-border spinner-border-sm me-1"></span>
                                  Processing...
                                </>
                              ) : '💵 Pay Now'}
                            </button>
                          </div>
                        ) : (
                          <span className="text-success fw-bold">✓ Paid</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="row mt-4">
            <div className="col-12">
              <div className="card bg-light">
                <div className="card-body">
                  <h5 className="card-title">📊 Booking Summary</h5>
                  <div className="row">
                    <div className="col-4">
                      <small className="text-muted">Total</small>
                      <h3>{bookings.length}</h3>
                    </div>
                    <div className="col-4">
                      <small className="text-muted">Paid</small>
                      <h3 className="text-success">
                        {bookings.filter(b => b.paymentStatus === "paid" || b.paymentStatus === "complete").length}
                      </h3>
                    </div>
                    <div className="col-4">
                      <small className="text-muted">Pending</small>
                      <h3 className="text-warning">
                        {bookings.filter(b => b.paymentStatus === "pending").length}
                      </h3>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Profile;