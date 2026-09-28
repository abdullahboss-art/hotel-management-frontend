import { Link, useNavigate } from "react-router-dom";
import { FaUserCircle } from "react-icons/fa";
import { useEffect, useRef, useState } from "react";
import "../public/css/style.css";

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const profileRef = useRef(null);
  const navigate = useNavigate();

  // =========================
  // GET LOGIN DATA
  // =========================
  const email = localStorage.getItem("email");
  const token = localStorage.getItem("token");
  const profile = localStorage.getItem("profile");

  // =========================
  // GET USER NAME
  // =========================
  let userName = "User";

  if (profile) {
    try {
      const profileData = JSON.parse(profile);

      userName =
        profileData?.name ||
        profileData?.username ||
        profileData?.fullName ||
        "User";
    } catch {
      userName = profile;
    }
  }

  // =========================
  // SCROLL EFFECT
  // =========================
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // =========================
  // CLOSE DROPDOWN ON OUTSIDE CLICK
  // =========================
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target)
      ) {
        setProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  // =========================
  // LOGOUT
  // =========================
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("email");
    localStorage.removeItem("profile");

    setProfileOpen(false);
    setMenuOpen(false);

    navigate("/login");
  };

  // =========================
  // CLOSE MOBILE MENU
  // =========================
  const closeMenu = () => {
    setMenuOpen(false);
    setProfileOpen(false);
  };

  return (
    <header
      className={`site-header ${
        scrolled ? "navbar-scrolled" : ""
      }`}
    >
      {/* Extra styling for the elements the base stylesheet doesn't
          cover yet: the logo image + wordmark pairing, and the
          gold "Book Now" pill. Everything else still relies on the
          existing site-header / site-navbar / menu classes. */}
      <style>{`
        .sogo-logo-link {
          display: flex;
          align-items: center;
        
          text-decoration: none;
        }

        .sogo-logo-mark {
          width: 50px;
          height: 50px;
          object-fit: contain;
          flex-shrink: 0;
        }

        .sogo-logo-wordmark {
          color: #fff;
          font-family: "Playfair Display", times, serif;
          font-size: 27px;
          font-weight: 700;
        
         
        }

        .site-header.navbar-scrolled .sogo-logo-wordmark {
          color: #fff;
        }

        .sogo-book-now {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 15px 36px;
          margin-left: 10px;
          border-radius: 50px;
          background: linear-gradient(135deg, #ffcf85 0%, #e8a33e 100%);
          color: #2b2417 !important;
          font-size: 15px;
          font-weight: 1000;
          width: 120%;
          letter-spacing: 0.03em;
          text-decoration: none !important;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          box-shadow: 0 5px 16px rgba(232, 163, 62, 0.4);
        }

        .sogo-book-now::before {
          display: none !important;
        }

        .sogo-book-now:hover {
          transform: translateY(-1px);
          box-shadow: 0 9px 22px rgba(232, 163, 62, 0.5);
          color: #2b2417 !important;
        }

        @media (max-width: 991.98px) {
          .sogo-logo-mark {
            width: 42px;
            height: 42px;
          }

          .sogo-logo-wordmark {
            font-size: 23px;
          }

          .sogo-book-now {
            display: inline-flex;
            margin: 14px 0 0;
            padding: 14px 34px;
          }
        }
      `}</style>

      <div className="container-fluid">
        <div className="row align-items-center">

          {/* =========================
              LOGO
          ========================= */}
          <div className="col-6 col-lg-4 site-logo">
            <Link
              to="/"
              onClick={closeMenu}
              className="sogo-logo-link"
            >
              <img
                src="/images/Logo_Hotek.png"
                alt="Sogo Hotel"
                className="sogo-logo-mark"
              />
              <span className="sogo-logo-wordmark">
                Sogo Hotel
              </span>
            </Link>
          </div>

          {/* =========================
              NAVIGATION
          ========================= */}
          <div className="col-6 col-lg-8 text-right">

            {/* MOBILE TOGGLE */}
            <div
              className={`site-menu-toggle ${
                menuOpen ? "active" : ""
              }`}
              onClick={() => setMenuOpen(!menuOpen)}
            >
              <span></span>
              <span className="spen"></span>
              <span></span>
            </div>

            {/* =========================
                NAVBAR
            ========================= */}
            <div
              className={`site-navbar ${
                menuOpen ? "active" : ""
              }`}
            >
              <nav>
                <ul className="menu list-unstyled text-center">

                  {/* HOME */}
                  <li>
                    <Link to="/" onClick={closeMenu}>
                      Home
                    </Link>
                  </li>

                  {/* ROOMS */}
                  <li>
                    <Link to="/Rooms" onClick={closeMenu}>
                      Rooms
                    </Link>
                  </li>

                  {/* ABOUT */}
                  <li>
                    <Link to="/About" onClick={closeMenu}>
                      About
                    </Link>
                  </li>
                  <li>
                    <Link to="/Event" onClick={closeMenu}>
                      Events
                    </Link>
                  </li>

                 

                  {/* CONTACT */}
                  <li>
                    <Link to="/Contact" onClick={closeMenu}>
                      Contact
                    </Link>
                  </li>

                  {/* =========================
                      LOGGED IN USER
                  ========================= */}
                  {token ? (
                    <li
                      className="navbar-profile"
                      ref={profileRef}
                    >
                      {/* PROFILE ICON */}
                      <button
                        type="button"
                        className="profile-button"
                        onClick={() =>
                          setProfileOpen(!profileOpen)
                        }
                        title="Profile"
                      >
                        <FaUserCircle size={30} />
                      </button>

                      {/* =========================
                          PROFILE DROPDOWN
                      ========================= */}
                      {profileOpen && (
                        <div className="profile-dropdown">

                          {/* USER NAME */}
                          <div className="profile-user">
                            <FaUserCircle
                              size={45}
                              className="profile-dropdown-icon"
                            />

                            <div>
                              <h6>{userName}</h6>
                              <span>Guest</span>
                            </div>
                          </div>

                          <div className="profile-divider"></div>

                          {/* EMAIL */}
                          <div className="profile-info">
                            <small>Email</small>
                            <p>{email || "No email"}</p>
                          </div>

                          <div className="profile-divider"></div>

                          {/* PROFILE */}
                          <Link
                            to="/profile"
                            className="profile-menu-link"
                            onClick={() =>
                              setProfileOpen(false)
                            }
                          >
                            My Profile
                          </Link>

                          {/* LOGOUT */}
                          <button
                            type="button"
                            className="profile-logout"
                            onClick={handleLogout}
                          >
                            Logout
                          </button>

                        </div>
                      )}
                    </li>
                  ) : (
                    /* SIGN UP */
                    <li>
                      <Link
                        to="/Signup"
                        onClick={closeMenu}
                      >
                        SignUp
                      </Link>
                    </li>
                  )}

                  {/* =========================
                      BOOK NOW
                  ========================= */}
                  <li>
                    <Link
                      to="/Contact"
                      onClick={closeMenu}
                      className="sogo-book-now"
                    >
                     Contact Us
                    </Link>
                  </li>

                </ul>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
