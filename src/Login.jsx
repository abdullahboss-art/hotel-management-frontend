


import React, { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import axios from "axios";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || "/rooms"; // Jahan se aaya tha wahan wapas

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // ✅ Backend login endpoint
      const res = await axios.post("http://localhost:5000/auth/login", {
        email: formData.email,
        password: formData.password,
      });

      console.log("Login response:", res.data);

      // ✅ Store token
      localStorage.setItem("token", res.data.token);
      
      // ✅ Store email
      localStorage.setItem("email", res.data.email || formData.email);
      
      // ✅ IMPORTANT: Store guest info for booking
      if (res.data.user) {
        // If backend returns user object
        localStorage.setItem("guest", JSON.stringify(res.data.user));
      } else {
        // Create minimal guest object from email
        const guestObj = {
          _id: res.data.userId || res.data.id || "guest-" + Date.now(),
          email: res.data.email || formData.email,
          name: res.data.name || formData.email.split('@')[0]
        };
        localStorage.setItem("guest", JSON.stringify(guestObj));
      }

      console.log("Login successful! Token and guest info saved");

      // ✅ Debug: Check what's saved
      console.log("Token:", localStorage.getItem("token"));
      console.log("Guest:", localStorage.getItem("guest"));

      // ✅ Redirect to previous page or Rooms page
      navigate(from, { replace: true });

    } catch (error) {
      console.error("Login failed:", error.response?.data || error.message);
      alert(error.response?.data?.message || "Login failed. Please try again.");
    }
  };

  return (
    <section className="section bg-light min-vh-100 d-flex align-items-center">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-6 col-lg-5">
            <div className="card shadow p-4">
              <h2 className="text-center mb-4">Login</h2>

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    name="email"
                    className="form-control"
                    placeholder="Enter email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="form-label">Password</label>
                  <input
                    type="password"
                    name="password"
                    className="form-control"
                    placeholder="Enter password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                </div>

                <button type="submit" className="btn btn-primary w-100 py-2">
                  Login
                </button>
              </form>

              <p className="text-center mt-3 text-muted">
                Don't have an account? <Link to="/signup">Sign Up</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Login;