import React, { useState } from "react";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    message: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    console.log("Contact Form:", formData);

    alert("Thank you! Your message has been sent successfully.");

    setFormData({
      name: "",
      phone: "",
      email: "",
      message: "",
    });
  };

  const testimonials = [
    {
      image: "person_1.jpg",
      name: "Sarah Williams",
      role: "Wedding Guest",
      message:
        "The service was excellent and the entire experience was smooth from start to finish. The team was professional, friendly and very helpful.",
    },
    {
      image: "person_2.jpg",
      name: "Michael Anderson",
      role: "Event Guest",
      message:
        "A beautiful place with outstanding service. Everything was perfectly organized and the staff made our event truly memorable.",
    },
    {
      image: "person_3.jpg",
      name: "Emily Johnson",
      role: "Corporate Guest",
      message:
        "We had a wonderful experience. The attention to detail, comfortable environment and professional staff exceeded our expectations.",
    },
  ];

  return (
    <>
      {/* =====================================================
          HOME PAGE THEME
      ===================================================== */}
      <style>
        {`
          .contact-page-theme {
            --sg-bg: #0d0f14;
            --sg-bg-soft: #12151c;
            --sg-card: #171b23;
            --sg-border: #262b35;
            --sg-text: #f4f1ea;
            --sg-text-muted: #a7a9b3;
            --sg-gold: #e8a33e;
            --sg-gold-light: #ffcf85;
          }

          .contact-page-theme {
            background: var(--sg-bg);
            color: var(--sg-text);
          }

          .contact-page-theme .heading,
          .contact-page-theme h1,
          .contact-page-theme h2,
          .contact-page-theme h3,
          .contact-page-theme h4,
          .contact-page-theme h5,
          .contact-page-theme h6,
          .contact-page-theme strong,
          .contact-page-theme label {
            color: var(--sg-text) !important;
          }

          .contact-page-theme .text-muted {
            color: var(--sg-text-muted) !important;
          }

          .contact-page-theme .contact-section {
            background: var(--sg-bg);
          }

          .contact-page-theme .contact-form-wrapper {
            background: var(--sg-card) !important;
            border: 1px solid var(--sg-border) !important;
            box-shadow: 0 15px 45px rgba(0, 0, 0, 0.22) !important;
          }

          .contact-page-theme .contact-form-wrapper p {
            color: var(--sg-text-muted);
          }

          .contact-page-theme .form-control {
            background: var(--sg-bg-soft);
            color: var(--sg-text);
            border: 1px solid var(--sg-border);
          }

          .contact-page-theme .form-control::placeholder {
            color: #777d89;
          }

          .contact-page-theme .form-control:focus {
            background: var(--sg-bg-soft);
            color: var(--sg-text);
            border-color: var(--sg-gold);
            box-shadow: 0 0 0 0.15rem rgba(232, 163, 62, 0.12);
          }

          .contact-page-theme .contact-info-box {
            background: var(--sg-card) !important;
            border: 1px solid var(--sg-border);
          }

          .contact-page-theme .contact-icon-box {
            background: var(--sg-bg-soft) !important;
            border: 1px solid var(--sg-border);
            color: var(--sg-gold) !important;
          }

          .contact-page-theme .contact-info-box a {
            color: var(--sg-text-muted) !important;
          }

          .contact-page-theme .contact-info-box a:hover {
            color: var(--sg-gold-light) !important;
            text-decoration: none;
          }

          .contact-page-theme .office-hours {
            border-top: 1px solid var(--sg-border) !important;
          }

          .contact-page-theme .btn-gold {
            background: linear-gradient(
              135deg,
              var(--sg-gold-light),
              var(--sg-gold)
            );
            color: #2b2417 !important;
            border: none;
            font-weight: 700;
            transition: all 0.25s ease;
          }

          .contact-page-theme .btn-gold:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 25px rgba(232, 163, 62, 0.18);
          }

          .contact-page-theme .testimonial-section {
            background: var(--sg-bg-soft) !important;
          }

          .contact-page-theme .testimonial-card {
            background: var(--sg-card) !important;
            border: 1px solid var(--sg-border);
            box-shadow: 0 10px 35px rgba(0, 0, 0, 0.20) !important;
          }

          .contact-page-theme .testimonial-card blockquote p {
            color: var(--sg-text-muted) !important;
          }

          .contact-page-theme .testimonial-stars {
            color: var(--sg-gold);
          }

          .contact-page-theme .gold-text {
            color: var(--sg-gold) !important;
          }

          .contact-page-theme .testimonial-card small {
            color: var(--sg-text-muted) !important;
          }

          .contact-page-theme .custom-breadcrumbs a {
            color: var(--sg-gold-light);
          }

          .contact-page-theme .custom-breadcrumbs li {
            color: var(--sg-text);
          }

          .contact-page-theme .mouse-icon {
            border-color: rgba(255, 255, 255, 0.7);
          }

          .contact-page-theme .mouse-wheel {
            background: var(--sg-gold);
          }

          @media (max-width: 767px) {
            .contact-page-theme .contact-form-wrapper,
            .contact-page-theme .contact-info-box {
              padding: 28px !important;
            }
          }
        `}
      </style>

      <div className="contact-page-theme">

        {/* =====================================================
            HERO SECTION
        ===================================================== */}
        <section
          className="site-hero inner-page overlay"
          style={{
            backgroundImage: "url(/images/LuxeryRoom.jpg)",
            backgroundPosition: "center",
            backgroundSize: "cover",
          }}
          data-stellar-background-ratio="0.5"
        >
          <div className="container">
            <div className="row site-hero-inner justify-content-center align-items-center">
              <div className="col-md-10 text-center" data-aos="fade-up">
                <span
                  className="text-uppercase text-white mb-3 d-block"
                  style={{
                    fontSize: "13px",
                    letterSpacing: "4px",
                    opacity: 0.9,
                  }}
                >
                  We'd Love To Hear From You
                </span>

                <h1 className="heading mb-3">Contact Us</h1>

                <ul className="custom-breadcrumbs mb-4">
                  <li>
                    <a href="/">Home</a>
                  </li>
                  <li>&bullet;</li>
                  <li>Contact</li>
                </ul>
              </div>
            </div>
          </div>

          <a className="mouse smoothscroll" href="#next">
            <div className="mouse-icon">
              <span className="mouse-wheel"></span>
            </div>
          </a>
        </section>

        {/* =====================================================
            CONTACT SECTION
        ===================================================== */}
        <section className="section contact-section" id="next">
          <div className="container">

            {/* Section Heading */}
            <div className="row justify-content-center text-center mb-5">
              <div className="col-md-8" data-aos="fade-up">
                <span
                  className="text-uppercase gold-text"
                  style={{
                    fontSize: "13px",
                    letterSpacing: "3px",
                    fontWeight: "600",
                  }}
                >
                  Get In Touch
                </span>

                <h2 className="heading mt-2 mb-3">
                  Let's Start a Conversation
                </h2>

                <p className="text-muted">
                  Have a question, special request or want to plan your next
                  event? Our team is here to help. Send us a message and we'll
                  get back to you as soon as possible.
                </p>
              </div>
            </div>

            <div className="row">

              {/* =================================================
                  CONTACT FORM
              ================================================= */}
              <div className="col-lg-7 mb-5 mb-lg-0" data-aos="fade-up">
                <div
                  className="contact-form-wrapper"
                  style={{
                    padding: "40px",
                  }}
                >
                  <h3 className="mb-2">Send Us a Message</h3>

                  <p className="text-muted mb-4">
                    Fill out the form below and our team will contact you.
                  </p>

                  <form onSubmit={handleSubmit}>

                    {/* Name + Phone */}
                    <div className="row">
                      <div className="col-md-6 form-group mb-4">
                        <label htmlFor="name">Your Name</label>

                        <input
                          type="text"
                          id="name"
                          value={formData.name}
                          onChange={handleChange}
                          className="form-control"
                          placeholder="Enter your name"
                          required
                          style={{
                            height: "52px",
                            borderRadius: "0",
                            padding: "12px 15px",
                          }}
                        />
                      </div>

                      <div className="col-md-6 form-group mb-4">
                        <label htmlFor="phone">Phone Number</label>

                        <input
                          type="tel"
                          id="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          className="form-control"
                          placeholder="Enter your phone"
                          required
                          style={{
                            height: "52px",
                            borderRadius: "0",
                            padding: "12px 15px",
                          }}
                        />
                      </div>
                    </div>

                    {/* Email */}
                    <div className="form-group mb-4">
                      <label htmlFor="email">Email Address</label>

                      <input
                        type="email"
                        id="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="form-control"
                        placeholder="Enter your email address"
                        required
                        style={{
                          height: "52px",
                          borderRadius: "0",
                          padding: "12px 15px",
                        }}
                      />
                    </div>

                    {/* Message */}
                    <div className="form-group mb-4">
                      <label htmlFor="message">Your Message</label>

                      <textarea
                        id="message"
                        value={formData.message}
                        onChange={handleChange}
                        className="form-control"
                        placeholder="Write your message here..."
                        rows="7"
                        required
                        style={{
                          borderRadius: "0",
                          padding: "12px 15px",
                          resize: "vertical",
                        }}
                      ></textarea>
                    </div>

                    {/* Submit */}
                    <button
                      type="submit"
                      className="btn btn-gold font-weight-bold"
                      style={{
                        minWidth: "170px",
                        padding: "14px 25px",
                        borderRadius: "0",
                      }}
                    >
                      Send Message
                    </button>
                  </form>
                </div>
              </div>

              {/* =================================================
                  CONTACT INFORMATION
              ================================================= */}
              <div
                className="col-lg-5"
                data-aos="fade-up"
                data-aos-delay="150"
              >
                <div
                  className="contact-info-box"
                  style={{
                    padding: "40px",
                    height: "100%",
                  }}
                >
                  <span
                    className="text-uppercase gold-text"
                    style={{
                      fontSize: "12px",
                      letterSpacing: "2px",
                      fontWeight: "600",
                    }}
                  >
                    Contact Details
                  </span>

                  <h3 className="mt-2 mb-4">
                    We Are Here For You
                  </h3>

                  <p className="text-muted mb-4">
                    Whether you're planning a special event, making a booking,
                    or simply have a question, feel free to reach out to us.
                  </p>

                  {/* Address */}
                  <div className="d-flex mb-4">
                    <div
                      className="contact-icon-box"
                      style={{
                        width: "48px",
                        height: "48px",
                        minWidth: "48px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "20px",
                        marginRight: "18px",
                      }}
                    >
                      <span>⌖</span>
                    </div>

                    <div>
                      <h6 className="mb-1">Our Address</h6>

                      <p className="text-muted mb-0">
                        North Town Recidency
                        <br />
                      </p>
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="d-flex mb-4">
                    <div
                      className="contact-icon-box"
                      style={{
                        width: "48px",
                        height: "48px",
                        minWidth: "48px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "19px",
                        marginRight: "18px",
                      }}
                    >
                      <span>☎</span>
                    </div>

                    <div>
                      <h6 className="mb-1">Phone</h6>

                      <a
                        href="tel:+123445678910"
                        className="text-muted"
                      >
                        +9152635232
                      </a>
                    </div>
                  </div>

                  {/* Email */}
                  <div className="d-flex mb-4">
                    <div
                      className="contact-icon-box"
                      style={{
                        width: "48px",
                        height: "48px",
                        minWidth: "48px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "19px",
                        marginRight: "18px",
                      }}
                    >
                      <span>✉</span>
                    </div>

                    <div>
                      <h6 className="mb-1">Email</h6>

                      <a
                        href="mailto:abdullahmusharraf576@gmail.com"
                        className="text-muted"
                      >
                        abdullahmushararf576@gmail.com
                      </a>
                    </div>
                  </div>

                  {/* Opening Hours */}
                  <div
                    className="office-hours"
                    style={{
                      paddingTop: "25px",
                      marginTop: "25px",
                    }}
                  >
                    <h6 className="mb-3">Office Hours</h6>

                    <div className="d-flex justify-content-between mb-2">
                      <span className="text-muted">
                        Monday - Friday
                      </span>

                      <strong>
                        9:00 AM - 6:00 PM
                      </strong>
                    </div>

                    <div className="d-flex justify-content-between">
                      <span className="text-muted">
                        Saturday - Sunday
                      </span>

                      <strong>
                        10:00 AM - 4:00 PM
                      </strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================
            TESTIMONIAL SECTION
        ===================================================== */}
        <section className="section testimonial-section">
          <div className="container">

            <div
              className="row justify-content-center text-center mb-5"
              data-aos="fade-up"
            >
              <div className="col-md-7">
                <span
                  className="text-uppercase gold-text"
                  style={{
                    fontSize: "13px",
                    letterSpacing: "3px",
                    fontWeight: "600",
                  }}
                >
                  Guest Reviews
                </span>

                <h2 className="heading mt-2 mb-3">
                  What People Say
                </h2>

                <p className="text-muted">
                  Discover what our guests have to say about their experience
                  with us.
                </p>
              </div>
            </div>

            <div className="row">
              {testimonials.map((testimonial, index) => (
                <div
                  className="col-md-4 mb-4"
                  key={index}
                  data-aos="fade-up"
                  data-aos-delay={index * 100}
                >
                  <div
                    className="testimonial-card text-center h-100"
                    style={{
                      padding: "35px 28px",
                    }}
                  >

                    {/* Stars */}
                    <div
                      className="testimonial-stars mb-3"
                      style={{
                        letterSpacing: "3px",
                      }}
                    >
                      ★★★★★
                    </div>

                    {/* Image */}
                    <div className="author-image mb-3">
                      <img
                        src={`/images/${testimonial.image}`}
                        alt={testimonial.name}
                        className="rounded-circle mx-auto"
                        style={{
                          width: "75px",
                          height: "75px",
                          objectFit: "cover",
                          border: "2px solid #e8a33e",
                          padding: "2px",
                        }}
                      />
                    </div>

                    {/* Message */}
                    <blockquote className="mb-3">
                      <p
                        className="text-muted"
                        style={{
                          fontSize: "15px",
                          lineHeight: "1.8",
                        }}
                      >
                        “{testimonial.message}”
                      </p>
                    </blockquote>

                    {/* Name */}
                    <h6 className="mb-1">
                      {testimonial.name}
                    </h6>

                    <small className="text-muted">
                      {testimonial.role}
                    </small>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </section>

      </div>
    </>
  );
};

export default Contact;