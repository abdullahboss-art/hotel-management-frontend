import React, { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import axios from "axios";

import {
  FaCalendarAlt,
  FaSearch,
  FaFilter,
  FaTimes,
  FaEye,
  FaCheckCircle,
  FaClock,
  FaExclamationCircle,
  FaUsers,
  FaMapMarkerAlt,
  FaEnvelope,
  FaPhone,
  FaUser,
  FaArrowLeft,
  FaArrowRight,
} from "react-icons/fa";

import "./Event.css";

const API_URL = "http://localhost:5000";
const EVENT_URL = `${API_URL}/event/list`;

// IMPORTANT:
// Tumhare backend mein registration route:
// POST /event-registration/add
const REGISTER_URL = `${API_URL}/event-registration/add`;

const EVENTS_PER_PAGE = 6;

const categories = [
  { value: "all", label: "All Events" },
  { value: "wedding", label: "Wedding" },
  { value: "conference", label: "Conference" },
  { value: "party", label: "Party" },
  { value: "cultural", label: "Cultural" },
  { value: "corporate", label: "Corporate" },
  { value: "other", label: "Other" },
];

const statusLabels = {
  upcoming: "Upcoming",
  ongoing: "Ongoing",
  completed: "Completed",
  cancelled: "Cancelled",
};

function Event() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");

  const [currentPage, setCurrentPage] = useState(1);

  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [registerEvent, setRegisterEvent] = useState(null);

  const [registerLoading, setRegisterLoading] = useState(false);
  const [registerMessage, setRegisterMessage] = useState("");
  const [registerError, setRegisterError] = useState("");

  const [formData, setFormData] = useState({
    bookingDate: "",
    name: "",
    email: "",
    phone: "",
    guests: 1,
    specialRequest: "",
  });

  // ==========================================================
  // FETCH EVENTS
  // ==========================================================

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axios.get(EVENT_URL);

      let fetchedEvents = [];

      if (Array.isArray(response.data)) {
        fetchedEvents = response.data;
      } else if (Array.isArray(response.data?.events)) {
        fetchedEvents = response.data.events;
      } else if (Array.isArray(response.data?.data)) {
        fetchedEvents = response.data.data;
      }

      const activeEvents = fetchedEvents
        .filter(
          (event) =>
            String(event.status || "").toLowerCase() !== "cancelled"
        )
        .sort((a, b) =>
          String(a.title || "").localeCompare(String(b.title || ""))
        );

      setEvents(activeEvents);
    } catch (err) {
      console.error("Error fetching events:", err);

      setError(
        err.response?.data?.message ||
          "Unable to load events. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  // ==========================================================
  // EVENT IMAGE
  // ==========================================================

  const getEventImage = (event) => {
    if (!event) {
      return "/images/img_1.jpg";
    }

    const image =
      event.image ||
      event.imageUrl ||
      event.photo ||
      event.banner ||
      event.eventImage;

    if (!image) {
      return "/images/img_1.jpg";
    }

    const imageString = String(image);

    if (
      imageString.startsWith("http://") ||
      imageString.startsWith("https://") ||
      imageString.startsWith("data:")
    ) {
      return imageString;
    }

    if (imageString.startsWith("/")) {
      return `${API_URL}${imageString}`;
    }

    return `${API_URL}/${imageString.replace(/^\/+/, "")}`;
  };

  // ==========================================================
  // FORMAT DATE
  // ==========================================================

  const formatDate = (date) => {
    if (!date) {
      return "Date not available";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return String(date);
    }

    return parsedDate.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // ==========================================================
  // GET EVENT DATE
  // ==========================================================

  const getEventDate = (event) => {
    return (
      event?.date ||
      event?.eventDate ||
      event?.startDate ||
      event?.bookingDate ||
      null
    );
  };

  // ==========================================================
  // FILTER EVENTS
  // ==========================================================

  const filteredEvents = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    return events.filter((event) => {
      const title = String(event.title || "").toLowerCase();
      const description = String(event.description || "").toLowerCase();
      const category = String(event.category || "").toLowerCase();
      const location = String(event.location || "").toLowerCase();
      const status = String(event.status || "").toLowerCase();

      const matchesSearch =
        !search ||
        title.includes(search) ||
        description.includes(search) ||
        category.includes(search) ||
        location.includes(search);

      const matchesCategory =
        selectedCategory === "all" ||
        category === selectedCategory.toLowerCase();

      const matchesStatus =
        selectedStatus === "all" ||
        status === selectedStatus.toLowerCase();

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [
    events,
    searchTerm,
    selectedCategory,
    selectedStatus,
  ]);

  // ==========================================================
  // PAGINATION
  // ==========================================================

  const totalPages = Math.ceil(
    filteredEvents.length / EVENTS_PER_PAGE
  );

  const paginatedEvents = useMemo(() => {
    const startIndex =
      (currentPage - 1) * EVENTS_PER_PAGE;

    return filteredEvents.slice(
      startIndex,
      startIndex + EVENTS_PER_PAGE
    );
  }, [filteredEvents, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory, selectedStatus]);

  useEffect(() => {
    if (totalPages === 0) {
      setCurrentPage(1);
      return;
    }

    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  // ==========================================================
  // BODY SCROLL
  // ==========================================================

  useEffect(() => {
    if (showDetailsModal || showRegisterModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [showDetailsModal, showRegisterModal]);

  // ==========================================================
  // ESC KEY
  // ==========================================================

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key !== "Escape") return;

      if (showRegisterModal && !registerLoading) {
        closeRegisterModal();
      } else if (showDetailsModal) {
        closeDetailsModal();
      }
    };

    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, [
    showDetailsModal,
    showRegisterModal,
    registerLoading,
  ]);

  // ==========================================================
  // DETAILS MODAL
  // ==========================================================

  const openDetailsModal = (event) => {
    setSelectedEvent(event);
    setShowDetailsModal(true);
  };

  const closeDetailsModal = () => {
    setSelectedEvent(null);
    setShowDetailsModal(false);
  };

  // ==========================================================
  // REGISTER MODAL
  // ==========================================================

  const openRegisterModal = (event) => {
    setRegisterEvent(event);
    setShowRegisterModal(true);

    setRegisterMessage("");
    setRegisterError("");

    setFormData({
      bookingDate: "",
      name: "",
      email: "",
      phone: "",
      guests: 1,
      specialRequest: "",
    });
  };

  const closeRegisterModal = () => {
    if (registerLoading) return;

    setRegisterEvent(null);
    setShowRegisterModal(false);

    setRegisterMessage("");
    setRegisterError("");
  };

  // ==========================================================
  // FORM CHANGE
  // ==========================================================

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "guests"
          ? Math.max(1, Number(value) || 1)
          : value,
    }));
  };

  // ==========================================================
  // TODAY DATE
  // ==========================================================

  const getTodayDate = () => {
    const today = new Date();

    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  // ==========================================================
  // REGISTER EVENT
  // ==========================================================

  const handleRegister = async (e) => {
    e.preventDefault();

    setRegisterMessage("");
    setRegisterError("");

    if (!registerEvent?._id) {
      setRegisterError("Event information is missing.");
      return;
    }

    if (!formData.bookingDate) {
      setRegisterError("Please select a booking date.");
      return;
    }

    const selectedDate = new Date(
      `${formData.bookingDate}T00:00:00`
    );

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      setRegisterError(
        "Booking date cannot be in the past."
      );
      return;
    }

    if (!formData.name.trim()) {
      setRegisterError("Please enter your name.");
      return;
    }

    if (!formData.email.trim()) {
      setRegisterError("Please enter your email.");
      return;
    }

    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(formData.email.trim())) {
      setRegisterError(
        "Please enter a valid email address."
      );
      return;
    }

    if (!formData.phone.trim()) {
      setRegisterError(
        "Please enter your phone number."
      );
      return;
    }

    if (
      !formData.guests ||
      Number(formData.guests) < 1
    ) {
      setRegisterError(
        "Guests must be at least 1."
      );
      return;
    }

    try {
      setRegisterLoading(true);

      const payload = {
        eventId: registerEvent._id,
        bookingDate: formData.bookingDate,
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        guests: Number(formData.guests),
        specialRequest:
          formData.specialRequest.trim(),
      };

      const response = await axios.post(
        REGISTER_URL,
        payload
      );

      setRegisterMessage(
        response.data?.message ||
          "Your booking request has been submitted successfully."
      );

      setFormData({
        bookingDate: "",
        name: "",
        email: "",
        phone: "",
        guests: 1,
        specialRequest: "",
      });
    } catch (err) {
      console.error(
        "Registration error:",
        err
      );

      setRegisterError(
        err.response?.data?.message ||
          "Unable to submit booking. Please try again."
      );
    } finally {
      setRegisterLoading(false);
    }
  };

  // ==========================================================
  // RESET FILTERS
  // ==========================================================

  const resetFilters = () => {
    setSearchTerm("");
    setSelectedCategory("all");
    setSelectedStatus("all");
    setCurrentPage(1);
  };

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <div
      className="event-page"
      style={{
        background: "#0d0f14",
        color: "#f4f1ea",
      }}
    >
      {/* =====================================================
          HERO
      ===================================================== */}

      <section
        className="site-hero inner-page overlay"
        style={{
          backgroundImage:
            "linear-gradient(180deg, rgba(13,15,20,0.42), rgba(13,15,20,0.82)), url('/images/LuxeryRoom.jpg')",
        }}
      >
        <div className="container">
          <div className="row align-items-center justify-content-center text-center">
            <div className="col-lg-8">
              <h1
                className="heading mb-3"
                style={{
                  color: "#f4f1ea",
                  fontFamily:
                    "Georgia, 'Times New Roman', serif",
                    alignItems: "center",
                    marginTop: "180px",
                }}
              >
                Events
              </h1>

              <p
                style={{
                  color: "#f4f1ea",
                }}
              >
                Discover and book unforgettable
                events at our luxury hotel.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          EVENTS SECTION
      ===================================================== */}

      <section
        className="section event-main-section"
        style={{
          background: "#0d0f14",
        }}
      >
        <div className="container">

          {/* PAGE HEADER */}

          <div className="event-page-header">
            <div>
              <span
                className="event-eyebrow"
                style={{
                  color: "#e8a33e",
                  letterSpacing: "2px",
                }}
              >
                HOTEL EXPERIENCES
              </span>

              <h2
                className="heading"
                style={{
                  color: "#f4f1ea",
                  fontFamily:
                    "Georgia, 'Times New Roman', serif",
                }}
              >
                Upcoming Events
              </h2>

              <p
                style={{
                  color: "#a7a9b3",
                }}
              >
                Explore our upcoming events,
                celebrations and special occasions.
              </p>
            </div>

            <div
              className="event-count"
              style={{
                background: "#171b23",
                border: "1px solid #262b35",
                color: "#ffcf85",
              }}
            >
              <FaCalendarAlt />

              <span>
                {filteredEvents.length}{" "}
                {filteredEvents.length === 1
                  ? "Event"
                  : "Events"}
              </span>
            </div>
          </div>

          {/* FILTERS */}

          <div
            className="event-filters"
            style={{
              background: "#171b23",
              border: "1px solid #262b35",
            }}
          >
            <div
              className="event-search"
              style={{
                background: "#12151c",
                border: "1px solid #262b35",
              }}
            >
              <FaSearch
                style={{
                  color: "#e8a33e",
                }}
              />

              <input
                type="text"
                placeholder="Search events..."
                value={searchTerm}
                onChange={(e) =>
                  setSearchTerm(e.target.value)
                }
                style={{
                  background: "transparent",
                  color: "#f4f1ea",
                  border: "none",
                  outline: "none",
                }}
              />

              {searchTerm && (
                <button
                  type="button"
                  className="event-clear-search"
                  onClick={() =>
                    setSearchTerm("")
                  }
                  style={{
                    color: "#a7a9b3",
                  }}
                >
                  <FaTimes />
                </button>
              )}
            </div>

            <div
              className="event-select"
              style={{
                background: "#12151c",
                border: "1px solid #262b35",
              }}
            >
              <FaFilter
                style={{
                  color: "#e8a33e",
                }}
              />

              <select
                value={selectedCategory}
                onChange={(e) =>
                  setSelectedCategory(
                    e.target.value
                  )
                }
                style={{
                  background: "#12151c",
                  color: "#f4f1ea",
                  border: "none",
                  outline: "none",
                }}
              >
                {categories.map((category) => (
                  <option
                    key={category.value}
                    value={category.value}
                    style={{
                      background: "#171b23",
                      color: "#f4f1ea",
                    }}
                  >
                    {category.label}
                  </option>
                ))}
              </select>
            </div>

            <div
              className="event-select"
              style={{
                background: "#12151c",
                border: "1px solid #262b35",
              }}
            >
              <FaClock
                style={{
                  color: "#e8a33e",
                }}
              />

              <select
                value={selectedStatus}
                onChange={(e) =>
                  setSelectedStatus(
                    e.target.value
                  )
                }
                style={{
                  background: "#12151c",
                  color: "#f4f1ea",
                  border: "none",
                  outline: "none",
                }}
              >
                <option
                  value="all"
                  style={{
                    background: "#171b23",
                  }}
                >
                  All Status
                </option>

                <option
                  value="upcoming"
                  style={{
                    background: "#171b23",
                  }}
                >
                  Upcoming
                </option>

                <option
                  value="ongoing"
                  style={{
                    background: "#171b23",
                  }}
                >
                  Ongoing
                </option>

                <option
                  value="completed"
                  style={{
                    background: "#171b23",
                  }}
                >
                  Completed
                </option>
              </select>
            </div>

            <button
              type="button"
              className="event-reset-btn"
              onClick={resetFilters}
              title="Reset filters"
              style={{
                background:
                  "linear-gradient(135deg, #ffcf85, #e8a33e)",
                color: "#2b2417",
                border: "none",
              }}
            >
              <FaTimes />
            </button>
          </div>

          {/* LOADING */}

          {loading && (
            <div
              className="event-loading"
              style={{
                color: "#a7a9b3",
              }}
            >
              <div
                className="event-spinner"
                style={{
                  borderColor: "#262b35",
                  borderTopColor: "#e8a33e",
                }}
              />

              <p>Loading events...</p>
            </div>
          )}

          {/* ERROR */}

          {!loading && error && (
            <div
              className="event-state event-error"
              style={{
                background: "#171b23",
                border: "1px solid #4d2d2d",
                color: "#f4f1ea",
              }}
            >
              <FaExclamationCircle
                style={{
                  color: "#ff8f87",
                }}
              />

              <h3>
                Unable to Load Events
              </h3>

              <p
                style={{
                  color: "#a7a9b3",
                }}
              >
                {error}
              </p>

              <button
                type="button"
                onClick={fetchEvents}
                className="event-primary-btn"
                style={{
                  background:
                    "linear-gradient(135deg, #ffcf85, #e8a33e)",
                  color: "#2b2417",
                }}
              >
                Try Again
              </button>
            </div>
          )}

          {/* EMPTY */}

          {!loading &&
            !error &&
            paginatedEvents.length === 0 && (
              <div
                className="event-state event-empty"
                style={{
                  background: "#171b23",
                  border: "1px dashed #262b35",
                }}
              >
                <FaCalendarAlt
                  style={{
                    color: "#e8a33e",
                  }}
                />

                <h3
                  style={{
                    color: "#f4f1ea",
                  }}
                >
                  No Events Found
                </h3>

                <p
                  style={{
                    color: "#a7a9b3",
                  }}
                >
                  We couldn't find any events
                  matching your current filters.
                </p>

                <button
                  type="button"
                  className="event-primary-btn"
                  onClick={resetFilters}
                  style={{
                    background:
                      "linear-gradient(135deg, #ffcf85, #e8a33e)",
                    color: "#2b2417",
                  }}
                >
                  Clear Filters
                </button>
              </div>
            )}

          {/* EVENT CARDS */}

          {!loading &&
            !error &&
            paginatedEvents.length > 0 && (
              <div className="event-grid">
                {paginatedEvents.map((event) => {
                  const status = String(
                    event.status || "upcoming"
                  ).toLowerCase();

                  const date = getEventDate(event);

                  return (
                    <article
                      className="event-card"
                      key={event._id}
                      style={{
                        background: "#171b23",
                        border: "1px solid #262b35",
                      }}
                    >
                      {/* IMAGE */}

                      <div className="event-card-image">
                        <img
                          src={getEventImage(event)}
                          alt={
                            event.title ||
                            "Hotel Event"
                          }
                          onError={(e) => {
                            e.currentTarget.src =
                              "/images/img_1.jpg";
                          }}
                        />

                        <span
                          className={`event-status event-status-${status}`}
                        >
                          {statusLabels[status] ||
                            status}
                        </span>

                        {event.category && (
                          <span
                            className="event-category"
                            style={{
                              background:
                                "rgba(13,15,20,0.88)",
                              color: "#ffcf85",
                              border:
                                "1px solid rgba(232,163,62,0.35)",
                            }}
                          >
                            {event.category}
                          </span>
                        )}
                      </div>

                      {/* CONTENT */}

                      <div className="event-card-content">
                        <div
                          className="event-card-date"
                          style={{
                            color: "#e8a33e",
                          }}
                        >
                          <FaCalendarAlt />

                          <span>
                            {formatDate(date)}
                          </span>
                        </div>

                        <h3
                          style={{
                            color: "#f4f1ea",
                          }}
                        >
                          {event.title ||
                            "Hotel Event"}
                        </h3>

                        <div className="event-meta">
                          {event.location && (
                            <span
                              style={{
                                color: "#a7a9b3",
                              }}
                            >
                              <FaMapMarkerAlt
                                style={{
                                  color: "#e8a33e",
                                }}
                              />
                              {event.location}
                            </span>
                          )}

                          {event.capacity && (
                            <span
                              style={{
                                color: "#a7a9b3",
                              }}
                            >
                              <FaUsers
                                style={{
                                  color: "#e8a33e",
                                }}
                              />
                              {event.capacity} Guests
                            </span>
                          )}
                        </div>

                        <p
                          style={{
                            color: "#a7a9b3",
                          }}
                        >
                          {event.description
                            ? event.description.length >
                              130
                              ? `${event.description.substring(
                                  0,
                                  130
                                )}...`
                              : event.description
                            : "Join us for a memorable event experience at our luxury hotel."}
                        </p>

                        <div className="event-card-actions">
                          <button
                            type="button"
                            className="event-view-btn"
                            onClick={() =>
                              openDetailsModal(event)
                            }
                            style={{
                              background: "#12151c",
                              color: "#ffcf85",
                              border:
                                "1px solid #262b35",
                            }}
                          >
                            <FaEye />
                            View Details
                          </button>

                          {status !==
                            "completed" && (
                            <button
                              type="button"
                              className="event-book-btn"
                              onClick={() =>
                                openRegisterModal(
                                  event
                                )
                              }
                              style={{
                                background:
                                  "linear-gradient(135deg, #ffcf85, #e8a33e)",
                                color: "#2b2417",
                                border: "none",
                              }}
                            >
                              Book Now
                            </button>
                          )}
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}

          {/* PAGINATION */}

          {!loading &&
            !error &&
            totalPages > 1 && (
              <div className="event-pagination">
                <button
                  type="button"
                  disabled={currentPage === 1}
                  onClick={() =>
                    setCurrentPage((prev) =>
                      Math.max(1, prev - 1)
                    )
                  }
                  style={{
                    background: "#171b23",
                    color: "#ffcf85",
                    border: "1px solid #262b35",
                  }}
                >
                  <FaArrowLeft />
                </button>

                {Array.from(
                  {
                    length: totalPages,
                  },
                  (_, index) => index + 1
                ).map((page) => (
                  <button
                    type="button"
                    key={page}
                    className={
                      currentPage === page
                        ? "active"
                        : ""
                    }
                    onClick={() =>
                      setCurrentPage(page)
                    }
                    style={
                      currentPage === page
                        ? {
                            background:
                              "linear-gradient(135deg, #ffcf85, #e8a33e)",
                            color: "#2b2417",
                            border:
                              "1px solid #e8a33e",
                          }
                        : {
                            background: "#171b23",
                            color: "#a7a9b3",
                            border:
                              "1px solid #262b35",
                          }
                    }
                  >
                    {page}
                  </button>
                ))}

                <button
                  type="button"
                  disabled={
                    currentPage === totalPages
                  }
                  onClick={() =>
                    setCurrentPage((prev) =>
                      Math.min(
                        totalPages,
                        prev + 1
                      )
                    )
                  }
                  style={{
                    background: "#171b23",
                    color: "#ffcf85",
                    border: "1px solid #262b35",
                  }}
                >
                  <FaArrowRight />
                </button>
              </div>
            )}
        </div>
      </section>

      {/* =====================================================
          CTA
      ===================================================== */}

      <section
        className="event-cta"
        style={{
          backgroundImage:
            "linear-gradient(180deg, rgba(13,15,20,0.48), rgba(13,15,20,0.84)), url('/images/hero_4.jpg')",
        }}
      >
        <div className="container">
          <div className="event-cta-content">
            <div>
              <span
                style={{
                  color: "#ffcf85",
                  letterSpacing: "2px",
                }}
              >
                CREATE MEMORABLE MOMENTS
              </span>

              <h2
                style={{
                  color: "#f4f1ea",
                  fontFamily:
                    "Georgia, 'Times New Roman', serif",
                }}
              >
                Make Your Next Event
                Unforgettable
              </h2>

              <p
                style={{
                  color: "#a7a9b3",
                }}
              >
                From weddings and conferences
                to private celebrations, our hotel
                provides the perfect setting for
                your special occasion.
              </p>
            </div>

            <button
              type="button"
              className="event-cta-btn"
              onClick={() =>
                window.scrollTo({
                  top: 500,
                  behavior: "smooth",
                })
              }
              style={{
                background:
                  "linear-gradient(135deg, #ffcf85, #e8a33e)",
                color: "#2b2417",
                border: "none",
              }}
            >
              Explore Events
            </button>
          </div>
        </div>
      </section>

      {/* =====================================================
          DETAILS MODAL
      ===================================================== */}

      {showDetailsModal &&
        selectedEvent &&
        createPortal(
          <div
            className="event-modal-overlay"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                closeDetailsModal();
              }
            }}
            style={{
              background: "rgba(5,7,10,0.82)",
            }}
          >
            <div
              className="event-modal"
              style={{
                background: "#171b23",
                border: "1px solid #262b35",
              }}
            >
              <button
                type="button"
                className="event-modal-close"
                onClick={closeDetailsModal}
                aria-label="Close"
                style={{
                  background: "#12151c",
                  color: "#f4f1ea",
                  border: "1px solid #262b35",
                }}
              >
                <FaTimes />
              </button>

              <div className="event-modal-image">
                <img
                  src={getEventImage(
                    selectedEvent
                  )}
                  alt={
                    selectedEvent.title ||
                    "Event"
                  }
                  onError={(e) => {
                    e.currentTarget.src =
                      "/images/img_1.jpg";
                  }}
                />
              </div>

              <div className="event-modal-content">
                <div className="event-modal-badges">
                  <span
                    className={`event-status event-status-${String(
                      selectedEvent.status ||
                        "upcoming"
                    ).toLowerCase()}`}
                  >
                    {statusLabels[
                      String(
                        selectedEvent.status ||
                          "upcoming"
                      ).toLowerCase()
                    ] ||
                      selectedEvent.status}
                  </span>

                  {selectedEvent.category && (
                    <span
                      className="event-category"
                      style={{
                        background: "#12151c",
                        color: "#ffcf85",
                        border:
                          "1px solid #262b35",
                      }}
                    >
                      {selectedEvent.category}
                    </span>
                  )}
                </div>

                <h2
                  style={{
                    color: "#f4f1ea",
                  }}
                >
                  {selectedEvent.title ||
                    "Hotel Event"}
                </h2>

                <div className="event-detail-grid">
                  <div
                    className="event-detail-item"
                    style={{
                      background: "#12151c",
                      border: "1px solid #262b35",
                    }}
                  >
                    <FaCalendarAlt
                      style={{
                        color: "#e8a33e",
                      }}
                    />

                    <div>
                      <strong
                        style={{
                          color: "#f4f1ea",
                        }}
                      >
                        Date
                      </strong>

                      <span
                        style={{
                          color: "#a7a9b3",
                        }}
                      >
                        {formatDate(
                          getEventDate(
                            selectedEvent
                          )
                        )}
                      </span>
                    </div>
                  </div>

                  {selectedEvent.location && (
                    <div
                      className="event-detail-item"
                      style={{
                        background: "#12151c",
                        border:
                          "1px solid #262b35",
                      }}
                    >
                      <FaMapMarkerAlt
                        style={{
                          color: "#e8a33e",
                        }}
                      />

                      <div>
                        <strong
                          style={{
                            color: "#f4f1ea",
                          }}
                        >
                          Location
                        </strong>

                        <span
                          style={{
                            color: "#a7a9b3",
                          }}
                        >
                          {
                            selectedEvent.location
                          }
                        </span>
                      </div>
                    </div>
                  )}

                  {selectedEvent.capacity && (
                    <div
                      className="event-detail-item"
                      style={{
                        background: "#12151c",
                        border:
                          "1px solid #262b35",
                      }}
                    >
                      <FaUsers
                        style={{
                          color: "#e8a33e",
                        }}
                      />

                      <div>
                        <strong
                          style={{
                            color: "#f4f1ea",
                          }}
                        >
                          Capacity
                        </strong>

                        <span
                          style={{
                            color: "#a7a9b3",
                          }}
                        >
                          {
                            selectedEvent.capacity
                          }{" "}
                          Guests
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                <div
                  className="event-description-box"
                  style={{
                    background: "#12151c",
                    border: "1px solid #262b35",
                  }}
                >
                  <h4
                    style={{
                      color: "#ffcf85",
                    }}
                  >
                    About This Event
                  </h4>

                  <p
                    style={{
                      color: "#a7a9b3",
                    }}
                  >
                    {selectedEvent.description ||
                      "Experience an unforgettable event at our luxury hotel."}
                  </p>
                </div>

                {selectedEvent.specialRequest && (
                  <div
                    className="event-description-box"
                    style={{
                      background: "#12151c",
                      border:
                        "1px solid #262b35",
                    }}
                  >
                    <h4
                      style={{
                        color: "#ffcf85",
                      }}
                    >
                      Additional Information
                    </h4>

                    <p
                      style={{
                        color: "#a7a9b3",
                      }}
                    >
                      {
                        selectedEvent.specialRequest
                      }
                    </p>
                  </div>
                )}

                {String(
                  selectedEvent.status || ""
                ).toLowerCase() !==
                  "completed" && (
                  <button
                    type="button"
                    className="event-modal-book-btn"
                    onClick={() => {
                      closeDetailsModal();

                      setTimeout(() => {
                        openRegisterModal(
                          selectedEvent
                        );
                      }, 150);
                    }}
                    style={{
                      background:
                        "linear-gradient(135deg, #ffcf85, #e8a33e)",
                      color: "#2b2417",
                      border: "none",
                    }}
                  >
                    Book This Event
                  </button>
                )}
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* =====================================================
          REGISTER MODAL
      ===================================================== */}

      {showRegisterModal &&
        registerEvent &&
        createPortal(
          <div
            className="event-modal-overlay"
            onClick={(e) => {
              if (
                e.target === e.currentTarget &&
                !registerLoading
              ) {
                closeRegisterModal();
              }
            }}
            style={{
              background: "rgba(5,7,10,0.82)",
            }}
          >
            <div
              className="event-register-modal"
              style={{
                background: "#171b23",
                border: "1px solid #262b35",
              }}
            >
              <button
                type="button"
                className="event-modal-close"
                onClick={closeRegisterModal}
                disabled={registerLoading}
                aria-label="Close"
                style={{
                  background: "#12151c",
                  color: "#f4f1ea",
                  border: "1px solid #262b35",
                }}
              >
                <FaTimes />
              </button>

              <div
                className="event-register-header"
                style={{
                  background:
                    "linear-gradient(135deg, #ffcf85, #e8a33e)",
                  color: "#2b2417",
                }}
              >
                <div
                  className="event-register-icon"
                  style={{
                    color: "#2b2417",
                  }}
                >
                  <FaCalendarAlt />
                </div>

                <span>
                  EVENT REGISTRATION
                </span>

                <h2
                  style={{
                    color: "#2b2417",
                  }}
                >
                  Book Event
                </h2>

                <p
                  style={{
                    color: "rgba(43,36,23,0.78)",
                  }}
                >
                  Reserve your place for{" "}
                  <strong>
                    {registerEvent.title}
                  </strong>
                </p>
              </div>

              <div className="event-register-body">
                <div
                  className="event-registration-info"
                  style={{
                    background: "#12151c",
                    border: "1px solid #262b35",
                  }}
                >
                  <FaCalendarAlt
                    style={{
                      color: "#e8a33e",
                    }}
                  />

                  <div>
                    <strong
                      style={{
                        color: "#f4f1ea",
                      }}
                    >
                      {registerEvent.title}
                    </strong>

                    <span
                      style={{
                        color: "#a7a9b3",
                      }}
                    >
                      {formatDate(
                        getEventDate(
                          registerEvent
                        )
                      )}

                      {registerEvent.location
                        ? ` • ${registerEvent.location}`
                        : ""}
                    </span>
                  </div>
                </div>

                {/* SUCCESS */}

                {registerMessage && (
                  <div
                    className="event-success-message"
                    style={{
                      background:
                        "rgba(91,184,120,0.10)",
                      border:
                        "1px solid rgba(91,184,120,0.30)",
                      color: "#8fe0a5",
                    }}
                  >
                    <FaCheckCircle />

                    <div>
                      <strong>
                        Booking Submitted
                      </strong>

                      <span>
                        {registerMessage}
                      </span>
                    </div>
                  </div>
                )}

                {/* ERROR */}

                {registerError && (
                  <div
                    className="event-error-message"
                    style={{
                      background:
                        "rgba(194,59,52,0.10)",
                      border:
                        "1px solid rgba(194,59,52,0.30)",
                      color: "#ff8f87",
                    }}
                  >
                    <FaExclamationCircle />

                    <span>
                      {registerError}
                    </span>
                  </div>
                )}

                {/* FORM */}

                {!registerMessage && (
                  <form
                    onSubmit={handleRegister}
                  >
                    <div className="event-form-group">
                      <label
                        htmlFor="bookingDate"
                        style={{
                          color: "#a7a9b3",
                        }}
                      >
                        <FaCalendarAlt
                          style={{
                            color: "#e8a33e",
                          }}
                        />
                        Booking Date
                      </label>

                      <input
                        id="bookingDate"
                        className="event-form-control"
                        type="date"
                        name="bookingDate"
                        value={
                          formData.bookingDate
                        }
                        min={getTodayDate()}
                        onChange={
                          handleInputChange
                        }
                        required
                        style={{
                          background: "#12151c",
                          color: "#f4f1ea",
                          border:
                            "1px solid #262b35",
                        }}
                      />
                    </div>

                    <div className="event-form-group">
                      <label
                        htmlFor="name"
                        style={{
                          color: "#a7a9b3",
                        }}
                      >
                        <FaUser
                          style={{
                            color: "#e8a33e",
                          }}
                        />
                        Full Name
                      </label>

                      <input
                        id="name"
                        className="event-form-control"
                        type="text"
                        name="name"
                        placeholder="Enter your full name"
                        value={formData.name}
                        onChange={
                          handleInputChange
                        }
                        required
                        style={{
                          background: "#12151c",
                          color: "#f4f1ea",
                          border:
                            "1px solid #262b35",
                        }}
                      />
                    </div>

                    <div className="event-form-row">
                      <div className="event-form-group">
                        <label
                          htmlFor="email"
                          style={{
                            color: "#a7a9b3",
                          }}
                        >
                          <FaEnvelope
                            style={{
                              color: "#e8a33e",
                            }}
                          />
                          Email Address
                        </label>

                        <input
                          id="email"
                          className="event-form-control"
                          type="email"
                          name="email"
                          placeholder="Enter your email"
                          value={
                            formData.email
                          }
                          onChange={
                            handleInputChange
                          }
                          required
                          style={{
                            background:
                              "#12151c",
                            color: "#f4f1ea",
                            border:
                              "1px solid #262b35",
                          }}
                        />
                      </div>

                      <div className="event-form-group">
                        <label
                          htmlFor="phone"
                          style={{
                            color: "#a7a9b3",
                          }}
                        >
                          <FaPhone
                            style={{
                              color: "#e8a33e",
                            }}
                          />
                          Phone Number
                        </label>

                        <input
                          id="phone"
                          className="event-form-control"
                          type="tel"
                          name="phone"
                          placeholder="Enter phone number"
                          value={
                            formData.phone
                          }
                          onChange={
                            handleInputChange
                          }
                          required
                          style={{
                            background:
                              "#12151c",
                            color: "#f4f1ea",
                            border:
                              "1px solid #262b35",
                          }}
                        />
                      </div>
                    </div>

                    <div className="event-form-group">
                      <label
                        htmlFor="guests"
                        style={{
                          color: "#a7a9b3",
                        }}
                      >
                        <FaUsers
                          style={{
                            color: "#e8a33e",
                          }}
                        />
                        Number of Guests
                      </label>

                      <input
                        id="guests"
                        className="event-form-control"
                        type="number"
                        name="guests"
                        min="1"
                        value={
                          formData.guests
                        }
                        onChange={
                          handleInputChange
                        }
                        required
                        style={{
                          background: "#12151c",
                          color: "#f4f1ea",
                          border:
                            "1px solid #262b35",
                        }}
                      />
                    </div>

                    <div className="event-form-group">
                      <label
                        htmlFor="specialRequest"
                        style={{
                          color: "#a7a9b3",
                        }}
                      >
                        Special Request
                      </label>

                      <textarea
                        id="specialRequest"
                        className="event-form-control"
                        name="specialRequest"
                        rows="4"
                        placeholder="Any special requirements or requests?"
                        value={
                          formData.specialRequest
                        }
                        onChange={
                          handleInputChange
                        }
                        style={{
                          background: "#12151c",
                          color: "#f4f1ea",
                          border:
                            "1px solid #262b35",
                        }}
                      />
                    </div>

                    <div className="event-form-actions">
                      <button
                        type="button"
                        className="event-cancel-btn"
                        onClick={
                          closeRegisterModal
                        }
                        disabled={
                          registerLoading
                        }
                        style={{
                          background: "#12151c",
                          color: "#a7a9b3",
                          border:
                            "1px solid #262b35",
                        }}
                      >
                        Cancel
                      </button>

                      <button
                        type="submit"
                        className="event-submit-btn"
                        disabled={
                          registerLoading
                        }
                        style={{
                          background:
                            "linear-gradient(135deg, #ffcf85, #e8a33e)",
                          color: "#2b2417",
                          border: "none",
                        }}
                      >
                        {registerLoading ? (
                          <>
                            <span className="event-button-spinner" />
                            Submitting...
                          </>
                        ) : (
                          <>
                            <FaCheckCircle />
                            Confirm Booking
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                )}

                {/* SUCCESS ACTION */}

                {registerMessage && (
                  <div className="event-success-actions">
                    <button
                      type="button"
                      className="event-submit-btn"
                      onClick={
                        closeRegisterModal
                      }
                      style={{
                        background:
                          "linear-gradient(135deg, #ffcf85, #e8a33e)",
                        color: "#2b2417",
                        border: "none",
                      }}
                    >
                      Done
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}

export default Event;