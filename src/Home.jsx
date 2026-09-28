import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaCalendarAlt,
  FaUserFriends,
  FaChild,
  FaBed,
  FaPlay,
  FaArrowRight,
  FaWifi,
  FaUtensils,
  FaSwimmingPool,
  FaHeadset,
  FaChevronLeft,
  FaChevronRight,
  FaQuoteRight,
  FaFacebookF,
  FaInstagram,
  FaTwitter,
  FaLinkedinIn,
  FaYoutube,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaEnvelope,
  FaPaperPlane,
  FaTimes,
  FaBuilding,
  FaUserCircle,
} from "react-icons/fa";

function Home() {
  const navigate = useNavigate();

  // =====================================================
  // HERO SLIDES
  // =====================================================

  const heroSlides = [
    {
      image:
        "https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=1920&q=90",
      eyebrow: "Premium Hotel & Resort",
      titleLine1: "Experience Modern",
      titleLine2: "Luxury Living",
      description:
        "Discover a world of comfort, elegance and world-class service. Our hotel offers the perfect blend of modern amenities and traditional hospitality for an unforgettable stay.",
    },
    {
      image:
        "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1920&q=90",
      eyebrow: "Premium Living Spaces",
      titleLine1: "Beautiful Interiors.",
      titleLine2: "Exceptional Comfort.",
      description:
        "Enjoy sophisticated interiors, comfortable bedrooms and thoughtfully designed living spaces created for modern luxury living.",
    },
    {
      image:
        "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1920&q=90",
      eyebrow: "Luxury Lifestyle",
      titleLine1: "A Premium Stay For",
      titleLine2: "Your Perfect Trip",
      description:
        "Relax in a stylish apartment with premium furnishings, elegant design and everything you need for a comfortable and memorable experience.",
    },
  ];

  const [currentSlide, setCurrentSlide] = useState(0);
  const [showVideo, setShowVideo] = useState(false);

  const luxuryVideoUrl =
    "https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1&rel=0";

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((previous) =>
        previous === heroSlides.length - 1 ? 0 : previous + 1
      );
    }, 6000);

    return () => clearInterval(interval);
  }, [heroSlides.length]);

  const previousSlide = () => {
    setCurrentSlide((previous) =>
      previous === 0 ? heroSlides.length - 1 : previous - 1
    );
  };

  const nextSlide = () => {
    setCurrentSlide((previous) =>
      previous === heroSlides.length - 1 ? 0 : previous + 1
    );
  };

  const closeVideo = () => setShowVideo(false);

  // =====================================================
  // ROOMS
  // =====================================================

  const [rooms, setRooms] = useState([]);
  const [availableRooms, setAvailableRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);
  const [searched, setSearched] = useState(false);

  const [searchData, setSearchData] = useState({
    checkIn: "",
    checkOut: "",
    adults: "1",
    children: "0",
    roomType: "",
  });

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const response = await fetch("http://localhost:5000/rooms/");
        if (!response.ok) throw new Error("Failed to fetch rooms");

        const data = await response.json();
        let roomData = [];

        if (Array.isArray(data)) roomData = data;
        else if (Array.isArray(data.rooms)) roomData = data.rooms;
        else if (Array.isArray(data.data)) roomData = data.data;
        else if (Array.isArray(data.result)) roomData = data.result;

        setRooms(roomData);
      } catch (error) {
        console.error("Room Fetch Error:", error);
        setRooms([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRooms();
  }, []);

  const handleChange = (e) => {
    setSearchData((previous) => ({
      ...previous,
      [e.target.name]: e.target.value,
    }));
  };

  const getRoomNumber = (room) =>
    room.roomNumber || room.number || room.roomNo || room.room_number || room.no || room._id;

  const getRoomType = (room) =>
    room.roomType || room.type || room.room_type || room.name || room.roomName || "Deluxe Room";

  const getRoomPrice = (room) =>
    room.pricing?.pricePerNight ??
    room.price ??
    room.roomPrice ??
    room.pricePerNight ??
    room.rate ??
    room.amount ??
    0;

  const getRoomImage = (room) => {
    const image =
      room.image || room.img || room.imageUrl || room.roomImage || room.photo || room.imageURL;

    if (!image || typeof image !== "string") return "/images/room-1.jpg";
    if (image.startsWith("http")) return image;
    if (image.startsWith("/")) return `http://localhost:5000${image}`;
    return `http://localhost:5000/uploads/${image}`;
  };

  const getRoomCapacity = (room) =>
    Number(
      room.capacity ||
        room.maxGuests ||
        room.guests ||
        room.maxOccupancy ||
        room.persons ||
        room.adults ||
        999
    );

  const getRoomBedType = (room) => room.bedType || room.bed_type || "King Bed";

  const getRoomBadge = (room) => room.badge || room.tag || null;

  const convertToDate = (value) => {
    if (!value) return null;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return null;
    date.setHours(0, 0, 0, 0);
    return date;
  };

  const datesOverlap = (requestedCheckIn, requestedCheckOut, bookedCheckIn, bookedCheckOut) => {
    const requestStart = convertToDate(requestedCheckIn);
    const requestEnd = convertToDate(requestedCheckOut);
    const bookedStart = convertToDate(bookedCheckIn);
    const bookedEnd = convertToDate(bookedCheckOut);

    if (!requestStart || !requestEnd || !bookedStart || !bookedEnd) return false;
    return requestStart < bookedEnd && requestEnd > bookedStart;
  };

  const getBookingRoomNumber = (booking) => {
    const room =
      booking.room || booking.roomId || booking.roomNumber || booking.roomNo || booking.room_id;
    if (typeof room === "object" && room !== null) {
      return room.roomNumber || room.number || room.roomNo || room._id;
    }
    return room;
  };

  const getBookingCheckIn = (booking) =>
    booking.checkIn || booking.checkin || booking.check_in || booking.checkInDate || booking.startDate || booking.from;

  const getBookingCheckOut = (booking) =>
    booking.checkOut || booking.checkout || booking.check_out || booking.checkOutDate || booking.endDate || booking.to;

  const getBookingStatus = (booking) =>
    String(booking.status || booking.bookingStatus || booking.booking_status || "").toLowerCase();

  const handleAvailability = async (e) => {
    e.preventDefault();
    setSearched(false);
    setAvailableRooms([]);

    if (!searchData.checkIn || !searchData.checkOut) {
      alert("Please select Check In and Check Out dates.");
      return;
    }

    const checkInDate = convertToDate(searchData.checkIn);
    const checkOutDate = convertToDate(searchData.checkOut);

    if (!checkInDate || !checkOutDate) {
      alert("Please select valid dates.");
      return;
    }

    if (checkOutDate <= checkInDate) {
      alert("Check Out date must be after Check In date.");
      return;
    }

    try {
      setChecking(true);

      const bookingResponse = await fetch("http://localhost:5000/booking/list");
      if (!bookingResponse.ok) throw new Error("Unable to fetch booking information.");

      const bookingData = await bookingResponse.json();
      let bookings = [];

      if (Array.isArray(bookingData)) bookings = bookingData;
      else if (Array.isArray(bookingData.bookings)) bookings = bookingData.bookings;
      else if (Array.isArray(bookingData.data)) bookings = bookingData.data;
      else if (Array.isArray(bookingData.result)) bookings = bookingData.result;

      const selectedRoomType = searchData.roomType.trim().toLowerCase();
      const requiredGuests = Number(searchData.adults) + Number(searchData.children);

      const filteredRooms = rooms.filter((room) => {
        const roomType = getRoomType(room).toString().trim().toLowerCase();
        if (selectedRoomType && roomType !== selectedRoomType) return false;

        const capacity = getRoomCapacity(room);
        if (capacity !== 999 && capacity < requiredGuests) return false;

        const currentRoomNumber = String(getRoomNumber(room));

        const roomIsBooked = bookings.some((booking) => {
          const bookingStatus = getBookingStatus(booking);
          if (["cancelled", "canceled", "rejected", "completed"].includes(bookingStatus)) return false;

          const bookingRoomNumber = getBookingRoomNumber(booking);
          if (bookingRoomNumber === undefined || bookingRoomNumber === null) return false;

          const bookingRoom = String(bookingRoomNumber);
          if (bookingRoom !== currentRoomNumber) return false;

          const bookedCheckIn = getBookingCheckIn(booking);
          const bookedCheckOut = getBookingCheckOut(booking);

          return datesOverlap(searchData.checkIn, searchData.checkOut, bookedCheckIn, bookedCheckOut);
        });

        return !roomIsBooked;
      });

      setAvailableRooms(filteredRooms);
      setSearched(true);

      setTimeout(() => {
        document.getElementById("availability-results")?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 100);
    } catch (error) {
      console.error("Availability Check Error:", error);
      alert("Unable to check room availability. Please try again.");
    } finally {
      setChecking(false);
    }
  };

  const handleBookRoom = (room) => {
    const roomId = room._id || room.id;
    navigate("/booking", {
      state: {
        roomId,
        roomNumber: getRoomNumber(room),
        roomType: getRoomType(room),
        price: getRoomPrice(room),
        checkIn: searchData.checkIn,
        checkOut: searchData.checkOut,
        adults: searchData.adults,
        children: searchData.children,
      },
    });
  };

  const featuredRooms = rooms.slice(0, 3);
  const activeSlide = heroSlides[currentSlide];

  // =====================================================
  // STATIC CONTENT — AMENITIES / REVIEWS / NAV
  // =====================================================

  const navLinks = [
    { label: "Home", to: "/" },
    { label: "Rooms", to: "/Rooms" },
    { label: "About", to: "/About" },
    { label: "Events", to: "/Events" },
    { label: "Contact", to: "/Contact" },
  ];

  const amenities = [
    { icon: <FaWifi />, title: "Free Wi-Fi", text: "Stay connected always" },
    { icon: <FaSwimmingPool />, title: "Swimming Pool", text: "Relax & refresh" },
    { icon: <FaUtensils />, title: "Fine Dining", text: "Delicious cuisine & more" },
    { icon: <FaHeadset />, title: "24/7 Support", text: "We're always here" },
  ];

  const reviews = [
    {
      name: "Ahmed Khan",
      text: "Amazing experience! The staff was so kind and the rooms were spotless. Highly recommended!",
    },
    {
      name: "Sarah Ali",
      text: "The location is perfect and the food is delicious. Best hotel I've ever stayed in!",
    },
    {
      name: "Usman Ahmed",
      text: "Beautiful rooms with excellent service. I will definitely visit again.",
    },
    {
      name: "Fatima Noor",
      text: "One of the best hotels I've stayed at. Everything was perfect!",
    },
  ];

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

        * { box-sizing: border-box; }

        .sg-page {
          background: var(--sg-bg);
          color: var(--sg-text);
          font-family: "Poppins", "Segoe UI", sans-serif;
          overflow-x: hidden;
        }

        a { text-decoration: none; }

        /* ================= NAVBAR ================= */
        .sg-navbar {
          position: absolute;
          top: 0; left: 0; right: 0;
          z-index: 50;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 24px 60px;
        }
        .sg-logo { display: flex; align-items: center; gap: 10px; color: #fff; }
        .sg-logo-icon {
          width: 42px; height: 42px;
          display: flex; align-items: center; justify-content: center;
          background: linear-gradient(135deg, var(--sg-gold-light), var(--sg-gold));
          border-radius: 8px; color: #211d18; font-size: 18px;
        }
        .sg-logo-text { font-family: "Playfair Display", Georgia, serif; font-size: 19px; font-weight: 700; line-height: 1.1; }
        .sg-logo-sub { font-size: 10.5px; letter-spacing: 0.12em; color: var(--sg-text-muted); text-transform: uppercase; }
        .sg-nav-links { display: flex; align-items: center; gap: 34px; }
        .sg-nav-links a { color: #d8d5cd; font-size: 14px; font-weight: 500; position: relative; padding-bottom: 4px; }
        .sg-nav-links a.active { color: var(--sg-gold); }
        .sg-nav-links a.active::after {
          content: ""; position: absolute; left: 0; right: 0; bottom: -6px; height: 2px; background: var(--sg-gold);
        }
        .sg-nav-right { display: flex; align-items: center; gap: 18px; }
        .sg-icon-btn { color: #fff; font-size: 17px; opacity: 0.85; cursor: pointer; }
        .sg-contact-btn {
          padding: 10px 24px; border-radius: 50px; border: 1px solid rgba(255,255,255,0.4);
          color: #fff; font-size: 13px; font-weight: 600;
        }
        .sg-contact-btn:hover { background: var(--sg-gold); border-color: var(--sg-gold); color: #211d18; }

        /* ================= HERO ================= */
        .sg-hero { position: relative; min-height: 780px; overflow: hidden; display: flex; align-items: center; }
        .sg-hero-inner { position: relative; z-index: 3; width: 100%; padding: 0 60px; }
        .sg-hero-slides { position: absolute; inset: 0; z-index: 0; }
        .sg-hero-slide {
          position: absolute; inset: 0; background-position: center; background-size: cover;
          opacity: 0; transform: scale(1.04); transition: opacity 1s ease, transform 7s ease;
        }
        .sg-hero-slide.active { opacity: 1; transform: scale(1); }
        .sg-hero-overlay {
          position: absolute; inset: 0; z-index: 1;
          background: linear-gradient(90deg, rgba(8,9,12,0.92) 0%, rgba(8,9,12,0.72) 40%, rgba(8,9,12,0.35) 100%);
        }
        .sg-hero-content { max-width: 620px; text-align: left; }
        .sg-eyebrow {
          display: block; margin-bottom: 18px; color: var(--sg-gold-light);
          font-size: 13px; font-weight: 700; letter-spacing: 0.24em; text-transform: uppercase;
        }
        .sg-hero-heading {
          margin: 0 0 22px; color: #fff; font-family: "Playfair Display", Georgia, serif;
          font-size: clamp(34px, 4.4vw, 54px); font-weight: 700; line-height: 1.16;
        }
        .sg-hero-heading .gold { color: var(--sg-gold); }
        .sg-hero-text { max-width: 500px; margin: 0 0 34px; color: rgba(244,241,234,0.75); font-size: 15px; line-height: 1.8; }
        .sg-hero-actions { display: flex; align-items: center; justify-content: flex-start; gap: 28px; flex-wrap: wrap; }
        .sg-book-btn {
          display: inline-flex; align-items: center; gap: 8px; padding: 15px 32px; border-radius: 50px;
          background: linear-gradient(135deg, var(--sg-gold-light), var(--sg-gold));
          color: #2b2417; font-size: 13.5px; font-weight: 700; letter-spacing: 0.02em;
          box-shadow: 0 10px 28px rgba(232,163,62,0.3); transition: transform 0.2s ease;
        }
        .sg-book-btn:hover { transform: translateY(-2px); color: #2b2417; }
        .sg-video-btn { display: inline-flex; align-items: center; gap: 12px; background: transparent; border: none; color: #fff; font-size: 13.5px; font-weight: 600; cursor: pointer; }
        .sg-video-circle {
          width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center;
          border: 1px solid rgba(255,255,255,0.55); color: #fff; font-size: 12px;
        }
        .sg-slide-counter { margin-top: 44px; display: flex; align-items: center; justify-content: flex-start; gap: 10px; color: rgba(255,255,255,0.55); font-size: 12.5px; font-weight: 600; }
        .sg-slide-counter .num-active { color: var(--sg-gold); font-size: 14px; }
        .sg-slide-counter .line { width: 40px; height: 1px; background: rgba(255,255,255,0.3); }

        .sg-hero-controls { position: absolute; right: 55px; top: 200px; z-index: 5; display: flex; flex-direction: column; gap: 10px; }
        .sg-hero-arrow {
          width: 44px; height: 44px; display: flex; align-items: center; justify-content: center;
          border: 1px solid rgba(255,255,255,0.4); border-radius: 50%; background: rgba(255,255,255,0.05);
          color: #fff; cursor: pointer; transition: all 0.25s ease;
        }
        .sg-hero-arrow:hover { background: var(--sg-gold); border-color: var(--sg-gold); color: #211d18; }

        /* ================= VIDEO MODAL ================= */
        .sg-video-modal {
          position: fixed; inset: 0; z-index: 9999; display: flex; align-items: center; justify-content: center;
          padding: 25px; background: rgba(0,0,0,0.92);
        }
        .sg-video-content { position: relative; width: min(1000px, 94vw); background: #111; border-radius: 12px; overflow: hidden; }
        .sg-video-close {
          position: absolute; top: 12px; right: 14px; z-index: 5; width: 40px; height: 40px; border: none; border-radius: 50%;
          background: rgba(0,0,0,0.8); color: #fff; font-size: 16px; cursor: pointer; display: flex; align-items: center; justify-content: center;
        }
        .sg-video-frame { width: 100%; aspect-ratio: 16/9; background: #000; }
        .sg-video-frame iframe { width: 100%; height: 100%; border: 0; display: block; }

        /* ================= SEARCH BAR ================= */
        .sg-search-wrap { position: relative; z-index: 20; margin-top: -55px; padding: 0 60px; }
        .sg-search-card {
          max-width: 1240px; margin: 0 auto; padding: 26px 30px; background: var(--sg-card);
          border: 1px solid var(--sg-border); border-radius: 14px; box-shadow: 0 25px 60px rgba(0,0,0,0.45);
          display: grid; grid-template-columns: repeat(5, 1fr) auto; gap: 20px; align-items: end;
        }
        .sg-field label { display: flex; align-items: center; gap: 7px; margin-bottom: 9px; color: var(--sg-text-muted); font-size: 12px; font-weight: 600; }
        .sg-field input, .sg-field select {
          width: 100%; height: 46px; padding: 0 12px; border: 1px solid var(--sg-border); border-radius: 8px;
          background: #0d0f14; color: var(--sg-text); font-size: 13.5px; outline: none; color-scheme: dark;
        }
        .sg-field input:focus, .sg-field select:focus { border-color: var(--sg-gold); }
        .sg-search-submit {
          display: inline-flex; align-items: center; justify-content: center; gap: 8px; height: 46px; padding: 0 26px;
          border: none; border-radius: 8px; background: linear-gradient(135deg, var(--sg-gold-light), var(--sg-gold));
          color: #2b2417; font-size: 13px; font-weight: 700; white-space: nowrap; cursor: pointer;
        }
        .sg-search-submit:disabled { opacity: 0.6; cursor: not-allowed; }

        /* ================= SECTION HEADERS ================= */
        .sg-section { padding: 100px 0 90px; }
        .sg-container { max-width: 1240px; margin: 0 auto; padding: 0 60px; }
        .sg-section-header { display: flex; justify-content: space-between; align-items: flex-end; flex-wrap: wrap; gap: 14px; margin-bottom: 40px; }
        .sg-eyebrow-sm { display: block; margin-bottom: 10px; color: var(--sg-gold); font-size: 12.5px; font-weight: 700; letter-spacing: 0.2em; text-transform: uppercase; }
        .sg-title { margin: 0; color: #fff; font-family: "Playfair Display", Georgia, serif; font-size: 36px; font-weight: 700; }
        .sg-viewall { display: inline-flex; align-items: center; gap: 8px; color: #fff; font-size: 14px; font-weight: 600; border-bottom: 1px solid transparent; }
        .sg-viewall:hover { color: var(--sg-gold); border-color: var(--sg-gold); }

        /* ================= ROOMS ================= */
        .sg-rooms-section { background: var(--sg-bg); }
        .sg-rooms-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 28px; }
        .sg-room-card { background: var(--sg-card); border: 1px solid var(--sg-border); border-radius: 12px; overflow: hidden; transition: transform 0.3s ease, box-shadow 0.3s ease; }
        .sg-room-card:hover { transform: translateY(-6px); box-shadow: 0 18px 40px rgba(0,0,0,0.35); }
        .sg-room-image { position: relative; height: 230px; overflow: hidden; background: #1a1d24; }
        .sg-room-image img { width: 100%; height: 100%; object-fit: cover; display: block; transition: transform 0.5s ease; }
        .sg-room-card:hover .sg-room-image img { transform: scale(1.06); }
        .sg-room-badge {
          position: absolute; top: 14px; left: 14px; padding: 5px 14px; border-radius: 30px;
          background: linear-gradient(135deg, var(--sg-gold-light), var(--sg-gold)); color: #2b2417;
          font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em;
        }
        .sg-room-body { padding: 20px 22px 22px; }
        .sg-room-title { margin: 0 0 10px; color: #fff; font-family: "Playfair Display", Georgia, serif; font-size: 19px; font-weight: 700; }
        .sg-room-meta { display: flex; align-items: center; gap: 14px; flex-wrap: wrap; color: var(--sg-text-muted); font-size: 12px; margin-bottom: 18px; }
        .sg-room-meta span { display: inline-flex; align-items: center; gap: 6px; }
        .sg-room-footer { display: flex; align-items: center; justify-content: space-between; padding-top: 16px; border-top: 1px solid var(--sg-border); }
        .sg-room-price { color: var(--sg-gold); font-size: 17px; font-weight: 700; }
        .sg-room-price small { color: var(--sg-text-muted); font-size: 12px; font-weight: 500; }
        .sg-room-arrow {
          width: 38px; height: 38px; border-radius: 50%; border: 1px solid var(--sg-border);
          display: flex; align-items: center; justify-content: center; color: #fff; font-size: 12px;
          background: transparent; cursor: pointer; transition: all 0.2s ease;
        }
        .sg-room-arrow:hover { background: var(--sg-gold); border-color: var(--sg-gold); color: #211d18; }

        /* ================= AVAILABILITY RESULTS ================= */
        .sg-results-section { background: var(--sg-bg-soft); }
        .sg-results-empty { text-align: center; padding: 60px 30px; background: var(--sg-card); border: 1px solid var(--sg-border); border-radius: 12px; }
        .sg-results-empty svg { font-size: 40px; color: var(--sg-gold); margin-bottom: 14px; }
        .sg-btn-primary { display: inline-flex; align-items: center; padding: 12px 26px; border: none; border-radius: 8px; background: linear-gradient(135deg, var(--sg-gold-light), var(--sg-gold)); color: #2b2417; font-weight: 700; cursor: pointer; margin-top: 16px; }
        .sg-results-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 28px; }

        /* ================= WHY CHOOSE US ================= */
        .sg-why-section { background: var(--sg-bg); padding: 100px 0; }
        .sg-why-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 60px; align-items: center; }
        .sg-why-text p { color: var(--sg-text-muted); font-size: 14.5px; line-height: 1.8; margin: 18px 0 32px; max-width: 440px; }
        .sg-amenity-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 26px; }
        .sg-amenity { display: flex; align-items: flex-start; gap: 14px; }
        .sg-amenity-icon {
          flex-shrink: 0; width: 48px; height: 48px; border-radius: 50%; border: 1px solid var(--sg-gold);
          display: flex; align-items: center; justify-content: center; color: var(--sg-gold); font-size: 17px;
        }
        .sg-amenity h4 { margin: 0 0 4px; color: #fff; font-size: 14.5px; font-weight: 600; }
        .sg-amenity p { margin: 0; color: var(--sg-text-muted); font-size: 12.5px; }
        .sg-why-image { border-radius: 14px; overflow: hidden; height: 420px; }
        .sg-why-image img { width: 100%; height: 100%; object-fit: cover; display: block; }

        /* ================= TESTIMONIALS ================= */
        .sg-reviews-section { background: var(--sg-bg-soft); }
        .sg-reviews-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 24px; }
        .sg-review-card { background: var(--sg-card); border: 1px solid var(--sg-border); border-radius: 12px; padding: 26px; transition: transform 0.3s ease; }
        .sg-review-card:hover { transform: translateY(-5px); }
        .sg-review-quote { color: var(--sg-gold); font-size: 16px; margin-bottom: 14px; }
        .sg-review-stars { color: var(--sg-gold); font-size: 13px; letter-spacing: 2px; margin-top: 14px; }
        .sg-review-card p { color: var(--sg-text-muted); font-size: 13.5px; line-height: 1.75; margin: 0 0 16px; min-height: 78px; }
        .sg-review-name { color: #fff; font-size: 14px; font-weight: 600; margin: 0; }
        .sg-review-sub { color: var(--sg-text-muted); font-size: 11.5px; }

        /* ================= CTA ================= */
        .sg-cta-section {
          position: relative; padding: 110px 0; text-align: center;
          background: linear-gradient(rgba(8,9,12,0.75), rgba(8,9,12,0.75)),
            url("https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&w=1600&q=80") center/cover no-repeat fixed;
        }
        .sg-cta-eyebrow { display: block; margin-bottom: 14px; color: var(--sg-gold-light); font-size: 12.5px; font-weight: 700; letter-spacing: 0.22em; text-transform: uppercase; }
        .sg-cta-section h2 { margin: 0 0 16px; color: #fff; font-family: "Playfair Display", Georgia, serif; font-size: 36px; font-weight: 700; }
        .sg-cta-section p { color: rgba(255,255,255,0.75); font-size: 14.5px; max-width: 480px; margin: 0 auto 30px; }

        /* ================= FOOTER ================= */
        .sg-footer { background: #0a0b0f; border-top: 1px solid var(--sg-border); padding: 70px 0 26px; }
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
        .sg-social a { width: 36px; height: 36px; border-radius: 50%; border: 1px solid var(--sg-border); display: flex; align-items: center; justify-content: center; color: #fff; font-size: 13px; }
        .sg-social a:hover { background: var(--sg-gold); border-color: var(--sg-gold); color: #211d18; }
        .sg-newsletter-form { display: flex; margin-top: 14px; border: 1px solid var(--sg-border); border-radius: 8px; overflow: hidden; }
        .sg-newsletter-form input { flex: 1; background: transparent; border: none; padding: 12px 14px; color: #fff; font-size: 13px; outline: none; }
        .sg-newsletter-form button { background: linear-gradient(135deg, var(--sg-gold-light), var(--sg-gold)); border: none; padding: 0 18px; color: #2b2417; cursor: pointer; }
        .sg-footer-bottom { border-top: 1px solid var(--sg-border); padding-top: 22px; display: flex; justify-content: space-between; flex-wrap: wrap; gap: 10px; color: var(--sg-text-muted); font-size: 12.5px; }
        .sg-footer-bottom a { color: var(--sg-text-muted); }
        .sg-footer-bottom a:hover { color: var(--sg-gold); }

        /* ================= RESPONSIVE ================= */
        @media (max-width: 1150px) {
          .sg-search-card { grid-template-columns: repeat(3, 1fr); }
          .sg-footer-grid { grid-template-columns: 1fr 1fr; }
        }
        @media (max-width: 1000px) {
          .sg-nav-links { display: none; }
          .sg-rooms-grid, .sg-results-grid { grid-template-columns: repeat(2, 1fr); }
          .sg-reviews-grid { grid-template-columns: repeat(2, 1fr); }
          .sg-why-grid { grid-template-columns: 1fr; }
          .sg-why-image { height: 300px; }
        }
        @media (max-width: 700px) {
          .sg-navbar { padding: 18px 22px; }
          .sg-hero-inner { padding: 0 22px; }
          .sg-hero-controls { right: 20px; top: 170px; }
          .sg-search-wrap { margin-top: -30px; padding: 0 18px; }
          .sg-search-card { grid-template-columns: 1fr; padding: 20px; }
          .sg-container { padding: 0 20px; }
          .sg-rooms-grid, .sg-results-grid, .sg-reviews-grid { grid-template-columns: 1fr; }
          .sg-amenity-grid { grid-template-columns: 1fr; }
          .sg-hero-controls { display: none; }
          .sg-footer-grid { grid-template-columns: 1fr; gap: 30px; }
        }
      `}</style>

      <div className="sg-page">

        {/* =============== NAVBAR =============== */}
              {/* =============== HERO =============== */}
        <section className="sg-hero">
          <div className="sg-hero-slides">
            {heroSlides.map((slide, index) => (
              <div
                key={index}
                className={`sg-hero-slide ${currentSlide === index ? "active" : ""}`}
                style={{ backgroundImage: `url("${slide.image}")` }}
              />
            ))}
          </div>

          <div className="sg-hero-overlay" />

          <div className="sg-hero-inner">
            <div className="sg-hero-content">
              <span className="sg-eyebrow">{activeSlide.eyebrow}</span>

              <h1 key={`title-${currentSlide}`} className="sg-hero-heading">
                {activeSlide.titleLine1}{" "}
                <span className="gold">{activeSlide.titleLine2}</span>
              </h1>

              <p key={`desc-${currentSlide}`} className="sg-hero-text">
                {activeSlide.description}
              </p>

              <div className="sg-hero-actions">
                <Link to="/Reservation" className="sg-book-btn">
                  Book Now <FaArrowRight />
                </Link>

                <button type="button" className="sg-video-btn" onClick={() => setShowVideo(true)}>
                  <span className="sg-video-circle"><FaPlay /></span>
                  Watch Video
                </button>
              </div>
            </div>

            <div className="sg-slide-counter">
              <span className="num-active">0{currentSlide + 1}</span>
              <span className="line" />
              <span>0{heroSlides.length}</span>
            </div>
          </div>

          <div className="sg-hero-controls">
            <button type="button" className="sg-hero-arrow" onClick={previousSlide} aria-label="Previous Slide">
              <FaChevronLeft />
            </button>
            <button type="button" className="sg-hero-arrow" onClick={nextSlide} aria-label="Next Slide">
              <FaChevronRight />
            </button>
          </div>
        </section>

        {/* =============== VIDEO MODAL =============== */}
        {showVideo && (
          <div className="sg-video-modal" onClick={closeVideo}>
            <div className="sg-video-content" onClick={(e) => e.stopPropagation()}>
              <button type="button" className="sg-video-close" onClick={closeVideo} aria-label="Close video">
                <FaTimes />
              </button>
              <div className="sg-video-frame">
                <iframe src={luxuryVideoUrl} title="Hotel Video" allow="autoplay; encrypted-media" allowFullScreen />
              </div>
            </div>
          </div>
        )}

        {/* =============== SEARCH BAR =============== */}
        <div className="sg-search-wrap" id="availability">
          <form className="sg-search-card" onSubmit={handleAvailability}>
            <div className="sg-field">
              <label><FaCalendarAlt /> Check In</label>
              <input type="date" name="checkIn" value={searchData.checkIn} onChange={handleChange} required />
            </div>

            <div className="sg-field">
              <label><FaCalendarAlt /> Check Out</label>
              <input type="date" name="checkOut" value={searchData.checkOut} onChange={handleChange} required />
            </div>

            <div className="sg-field">
              <label><FaUserFriends /> Adults</label>
              <select name="adults" value={searchData.adults} onChange={handleChange}>
                <option value="1">1 Adult</option>
                <option value="2">2 Adults</option>
                <option value="3">3 Adults</option>
                <option value="4">4 Adults</option>
                <option value="5">5+ Adults</option>
              </select>
            </div>

            <div className="sg-field">
              <label><FaChild /> Children</label>
              <select name="children" value={searchData.children} onChange={handleChange}>
                <option value="0">No Children</option>
                <option value="1">1 Child</option>
                <option value="2">2 Children</option>
                <option value="3">3 Children</option>
                <option value="4">4+ Children</option>
              </select>
            </div>

            <div className="sg-field">
              <label><FaBed /> Room Type</label>
              <select name="roomType" value={searchData.roomType} onChange={handleChange}>
                <option value="">Any Room</option>
                <option value="Single">Single</option>
                <option value="Double">Double</option>
                <option value="Deluxe">Deluxe</option>
                <option value="Suite">Suite</option>
              </select>
            </div>

            <button type="submit" className="sg-search-submit" disabled={checking}>
              {checking ? "Checking..." : "Check Availability"}
            </button>
          </form>
        </div>

        {/* =============== AVAILABILITY RESULTS =============== */}
        {searched && (
          <section className="sg-section sg-results-section" id="availability-results">
            <div className="sg-container">
              <div className="sg-section-header" style={{ justifyContent: "center", textAlign: "center", display: "block" }}>
                <span className="sg-eyebrow-sm">Search Results</span>
                <h2 className="sg-title">Available Rooms</h2>
                <p style={{ color: "var(--sg-text-muted)", marginTop: 10 }}>
                  Rooms available from <strong style={{ color: "#fff" }}>{searchData.checkIn}</strong> to{" "}
                  <strong style={{ color: "#fff" }}>{searchData.checkOut}</strong>
                </p>
              </div>

              {availableRooms.length === 0 ? (
                <div className="sg-results-empty">
                  <FaBed />
                  <h3 style={{ color: "#fff", marginBottom: 8 }}>No Rooms Available</h3>
                  <p style={{ color: "var(--sg-text-muted)" }}>
                    Sorry, there are no rooms available for the selected dates and requirements.
                  </p>
                  <button
                    type="button"
                    className="sg-btn-primary"
                    onClick={() => { setSearched(false); setAvailableRooms([]); }}
                  >
                    Search Again
                  </button>
                </div>
              ) : (
                <div className="sg-results-grid">
                  {availableRooms.map((room, index) => (
                    <div className="sg-room-card" key={room._id || room.id || index}>
                      <div className="sg-room-image">
                        <img src={getRoomImage(room)} alt={getRoomType(room)} />
                      </div>
                      <div className="sg-room-body">
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                          <h3 className="sg-room-title" style={{ margin: 0 }}>{getRoomType(room) || "Luxury Room"}</h3>
                          <span style={{ color: "var(--sg-gold)", fontSize: 12 }}>★★★★★</span>
                        </div>
                        <p style={{ color: "var(--sg-text-muted)", fontSize: 12.5, marginBottom: 16 }}>
                          Room No: {getRoomNumber(room)}
                        </p>
                        <div className="sg-room-footer">
                          <div className="sg-room-price">
                            Rs. {getRoomPrice(room)}<small> / night</small>
                          </div>
                          <button type="button" className="sg-btn-primary" style={{ margin: 0 }} onClick={() => handleBookRoom(room)}>
                            Book Now
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

        {/* =============== OUR ROOMS =============== */}
        <section className="sg-section sg-rooms-section">
          <div className="sg-container">
            <div className="sg-section-header">
              <div>
                <span className="sg-eyebrow-sm">Luxury Accommodation</span>
                <h2 className="sg-title">Our Rooms</h2>
              </div>
              <Link to="/Rooms" className="sg-viewall">View All Rooms <FaArrowRight /></Link>
            </div>

            {loading ? (
              <p style={{ color: "var(--sg-text-muted)" }}>Loading rooms...</p>
            ) : featuredRooms.length === 0 ? (
              <p style={{ color: "var(--sg-text-muted)" }}>No rooms available right now. Please check back soon.</p>
            ) : (
              <div className="sg-rooms-grid">
                {featuredRooms.map((room, index) => (
                  <div className="sg-room-card" key={room._id || room.id || index}>
                    <div className="sg-room-image">
                      {getRoomBadge(room) && <span className="sg-room-badge">{getRoomBadge(room)}</span>}
                      <img
                        src={getRoomImage(room)}
                        alt={getRoomType(room)}
                        onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = "/images/room-1.jpg"; }}
                      />
                    </div>

                    <div className="sg-room-body">
                      <h3 className="sg-room-title">{getRoomType(room)}</h3>

                      <div className="sg-room-meta">
                        <span><FaUserFriends /> {getRoomCapacity(room) === 999 ? "2 Guests" : `${getRoomCapacity(room)} Guests`}</span>
                        <span><FaBed /> {getRoomBedType(room)}</span>
                      </div>

                      <div className="sg-room-footer">
                        <div className="sg-room-price">
                          ${getRoomPrice(room)}<small> / night</small>
                        </div>
                        <button type="button" className="sg-room-arrow" onClick={() => navigate("/Rooms")} aria-label="View room">
                          <FaArrowRight />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* =============== WHY CHOOSE US =============== */}
        <section className="sg-why-section">
          <div className="sg-container">
            <div className="sg-why-grid">
              <div className="sg-why-text">
                <span className="sg-eyebrow-sm">Why Choose Us</span>
                <h2 className="sg-title">Comfort, Luxury &amp; Exceptional Service</h2>
                <p>
                  From elegant rooms to world-class amenities, we make sure your stay is nothing short
                  of extraordinary.
                </p>

                <div className="sg-amenity-grid">
                  {amenities.map((item) => (
                    <div className="sg-amenity" key={item.title}>
                      <span className="sg-amenity-icon">{item.icon}</span>
                      <div>
                        <h4>{item.title}</h4>
                        <p>{item.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="sg-why-image">
                <img
                  src="https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=900&q=80"
                  alt="Hotel lounge"
                />
              </div>
            </div>
          </div>
        </section>

        {/* =============== TESTIMONIALS =============== */}
        <section className="sg-section sg-reviews-section">
          <div className="sg-container">
            <div className="sg-section-header" style={{ display: "block", textAlign: "center" }}>
              <span className="sg-eyebrow-sm">Guest Reviews</span>
              <h2 className="sg-title">What Our Guests Say</h2>
            </div>

            <div className="sg-reviews-grid">
              {reviews.map((review) => (
                <div className="sg-review-card" key={review.name}>
                  <FaQuoteRight className="sg-review-quote" />
                  <p>&quot;{review.text}&quot;</p>
                  <div className="sg-review-stars">★★★★★</div>
                  <p className="sg-review-name" style={{ marginTop: 14 }}>{review.name}</p>
                  <span className="sg-review-sub">Verified Guest</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* =============== FINAL CTA =============== */}
        <section className="sg-cta-section">
          <div className="sg-container">
            <span className="sg-cta-eyebrow">Special Offer</span>
            <h2>Ready To Experience Luxury?</h2>
            <p>
              Book your stay today and enjoy exclusive deals, comfortable rooms and unforgettable
              experiences.
            </p>
            <Link to="/Reservation" className="sg-book-btn">Book Your Stay <FaArrowRight /></Link>
          </div>
        </section>

       
      </div>
    </>
  );
}

export default Home;
