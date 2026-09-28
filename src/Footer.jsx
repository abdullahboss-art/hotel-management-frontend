import React from "react";
import { Link } from "react-router-dom";
import {
  FaBuilding,
  FaFacebookF,
  FaInstagram,
  FaTwitter,
  FaLinkedinIn,
  FaYoutube,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaEnvelope,
  FaPaperPlane,
} from "react-icons/fa";

const navLinks = [
  { label: "Home", to: "/" },
  { label: "Rooms", to: "/Rooms" },
  { label: "About", to: "/About" },
  { label: "Events", to: "/Events" },
  { label: "Contact", to: "/Contact" },
];

function Footer() {
  return (
    <>
      <style>{`
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

        .sg-footer * { box-sizing: border-box; }
        .sg-footer a { text-decoration: none; }

        .sg-footer {
          background: #0a0b0f;
          border-top: 1px solid var(--sg-border);
          padding: 70px 0 26px;
          font-family: "Poppins", "Segoe UI", sans-serif;
          color: var(--sg-text);
        }

        .sg-container { max-width: 1240px; margin: 0 auto; padding: 0 60px; }

        .sg-logo { display: flex; align-items: center; gap: 10px; color: #fff; }
        .sg-logo-icon {
          width: 42px; height: 42px;
          display: flex; align-items: center; justify-content: center;
          background: linear-gradient(135deg, var(--sg-gold-light), var(--sg-gold));
          border-radius: 8px; color: #211d18; font-size: 18px;
        }
        .sg-logo-text { font-family: "Playfair Display", Georgia, serif; font-size: 19px; font-weight: 700; line-height: 1.1; }
        .sg-logo-sub { font-size: 10.5px; letter-spacing: 0.12em; color: var(--sg-text-muted); text-transform: uppercase; }

        .sg-footer-grid { display: grid; grid-template-columns: 1.6fr 1fr 1.2fr 1.2fr; gap: 40px; margin-bottom: 50px; }
        .sg-footer p { color: var(--sg-text-muted); font-size: 13px; line-height: 1.8; }
        .sg-footer h5 { color: #fff; font-size: 14.5px; font-weight: 700; margin-bottom: 20px; }

        .sg-footer-links { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 11px; }
        .sg-footer-links a { color: var(--sg-text-muted); font-size: 13px; }
        .sg-footer-links a:hover { color: var(--sg-gold); }

        .sg-footer-contact { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 13px; }
        .sg-footer-contact li { display: flex; gap: 10px; color: var(--sg-text-muted); font-size: 13px; }
        .sg-footer-contact svg { color: var(--sg-gold); margin-top: 3px; flex-shrink: 0; }

        .sg-social { display: flex; gap: 10px; margin-top: 20px; }
        .sg-social a {
          width: 36px; height: 36px; border-radius: 50%; border: 1px solid var(--sg-border);
          display: flex; align-items: center; justify-content: center; color: #fff; font-size: 13px;
        }
        .sg-social a:hover { background: var(--sg-gold); border-color: var(--sg-gold); color: #211d18; }

        .sg-newsletter-form { display: flex; margin-top: 14px; border: 1px solid var(--sg-border); border-radius: 8px; overflow: hidden; }
        .sg-newsletter-form input { flex: 1; background: transparent; border: none; padding: 12px 14px; color: #fff; font-size: 13px; outline: none; }
        .sg-newsletter-form button { background: linear-gradient(135deg, var(--sg-gold-light), var(--sg-gold)); border: none; padding: 0 18px; color: #2b2417; cursor: pointer; }

        .sg-footer-bottom {
          border-top: 1px solid var(--sg-border); padding-top: 22px; display: flex;
          justify-content: space-between; flex-wrap: wrap; gap: 10px; color: var(--sg-text-muted); font-size: 12.5px;
        }
        .sg-footer-bottom a { color: var(--sg-text-muted); }
        .sg-footer-bottom a:hover { color: var(--sg-gold); }

        @media (max-width: 1150px) {
          .sg-footer-grid { grid-template-columns: 1fr 1fr; }
        }
        @media (max-width: 700px) {
          .sg-container { padding: 0 20px; }
          .sg-footer-grid { grid-template-columns: 1fr; gap: 30px; }
        }
      `}</style>

      <footer className="sg-footer">
        <div className="sg-container">
          <div className="sg-footer-grid">
            <div>
              <Link to="/" className="sg-logo" style={{ marginBottom: 16 }}>
                <span className="sg-logo-icon"><FaBuilding /></span>
                <span>
                  <span className="sg-logo-text">Sogo Hotel</span><br />
                  <span className="sg-logo-sub">Luxury Redefined</span>
                </span>
              </Link>
              <p>
                Your comfort is our priority. Experience luxury, relaxation and world-class service
                at Sogo Hotel.
              </p>
              <div className="sg-social">
                <a href="#" aria-label="Facebook" onClick={(e) => e.preventDefault()}><FaFacebookF /></a>
                <a href="#" aria-label="Instagram" onClick={(e) => e.preventDefault()}><FaInstagram /></a>
                <a href="#" aria-label="Twitter" onClick={(e) => e.preventDefault()}><FaTwitter /></a>
                <a href="#" aria-label="LinkedIn" onClick={(e) => e.preventDefault()}><FaLinkedinIn /></a>
                <a href="#" aria-label="YouTube" onClick={(e) => e.preventDefault()}><FaYoutube /></a>
              </div>
            </div>

            <div>
              <h5>Quick Links</h5>
              <ul className="sg-footer-links">
                {navLinks.map((link) => (
                  <li key={link.label}><Link to={link.to}>{link.label}</Link></li>
                ))}
              </ul>
            </div>

            <div>
              <h5>Contact Us</h5>
              <ul className="sg-footer-contact">
                <li><FaMapMarkerAlt /> 198 West 27th Street, Suite 721, New York, NY 10016</li>
                <li><FaPhoneAlt /> +1 123 456 7890</li>
                <li><FaEnvelope /> abdullahmusharraf576@gmail.com</li>
              </ul>
              <p style={{ marginTop: 14 }}>
                <Link to="/contact" style={{ color: "var(--sg-gold-light)" }}>Contact Us →</Link>
              </p>
            </div>

            <div>
              <h5>Newsletter</h5>
              <p>Sign up for our newsletter</p>
              <form className="sg-newsletter-form" onSubmit={(e) => e.preventDefault()}>
                <input type="email" placeholder="Your email address" required />
                <button type="submit" aria-label="Subscribe"><FaPaperPlane /></button>
              </form>
            </div>
          </div>

          <div className="sg-footer-bottom">
            <span>© {new Date().getFullYear()} Sogo Hotel. All Rights Reserved.</span>
            <span>
              <a href="#" onClick={(e) => e.preventDefault()}>Privacy Policy</a> &nbsp;|&nbsp;{" "}
              <a href="#" onClick={(e) => e.preventDefault()}>Terms &amp; Conditions</a>
            </span>
          </div>
        </div>
      </footer>
    </>
  );
}

export default Footer;