import React, {
  useEffect,
  useMemo,
  useState,
} from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";


const API = "https://hotel-management-backend-kkyl.vercel.app";

const Rooms = () => {
  const [rooms, setRooms] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const [userBookings, setUserBookings] = useState([]);
  const [bookingExpiries, setBookingExpiries] = useState({});

  // ========================
  // HOUSEKEEPING
  // ========================
  const [housekeepingTasks, setHousekeepingTasks] = useState({});

  // ========================
  // FILTERS
  // ========================
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [selectedPriceRange, setSelectedPriceRange] =
    useState("");

  const [roomType, setRoomType] = useState("");
  const [bedType, setBedType] = useState("");
  const [viewType, setViewType] = useState("");

  const [searchText, setSearchText] = useState("");
  const [sortBy, setSortBy] = useState("");

  // ========================
  // NEW FRONTEND FEATURES
  // ========================
  const [favorites, setFavorites] = useState(() => {
    try {
      return JSON.parse(
        localStorage.getItem("favoriteRooms") || "[]"
      );
    } catch {
      return [];
    }
  });

  const [selectedRoom, setSelectedRoom] = useState(null);

  const navigate = useNavigate();

  // ========================
  // GET USER ID
  // ========================
  const getUserId = () => {
    try {
      const guestData = JSON.parse(
        localStorage.getItem("guest") || "{}"
      );

      return guestData._id || guestData.id;
    } catch {
      return null;
    }
  };

  const userId = getUserId();
  const token = localStorage.getItem("token");

  // ========================
  // FETCH ROOMS
  // ========================
  const fetchRooms = async () => {
    try {
      const roomsRes = await axios.get(`${API}/rooms`);

      setRooms(
        roomsRes.data?.data ||
          roomsRes.data ||
          []
      );
    } catch (err) {
      console.error("Fetch Rooms Error:", err);
      throw err;
    }
  };

  // ========================
  // FETCH USER BOOKINGS
  // ========================
  const fetchUserBookings = async () => {
    if (!token || !userId) return;

    try {
      const bookingsRes = await axios.get(
        `${API}/booking/guest/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const bookings =
        bookingsRes.data?.data || [];

      const bookedRoomIds = bookings
        .map(
          (booking) =>
            booking.roomId?._id ||
            booking.roomId
        )
        .filter(Boolean);

      setUserBookings(bookedRoomIds);

      const expiries = {};

      bookings.forEach((booking) => {
        const roomId =
          booking.roomId?._id ||
          booking.roomId;

        if (
          booking.status === "reserved" &&
          booking.expiresAt &&
          roomId
        ) {
          const expiryTime = new Date(
            booking.expiresAt
          ).getTime();

          if (expiryTime > Date.now()) {
            expiries[roomId] = expiryTime;
          }
        }
      });

      setBookingExpiries(expiries);

      localStorage.setItem(
        "bookingExpiries",
        JSON.stringify(expiries)
      );
    } catch (err) {
      console.error(
        "Error fetching user bookings:",
        err
      );
    }
  };

  // ========================
  // FETCH HOUSEKEEPING
  // ========================
  const fetchHousekeeping = async () => {
    try {
      const response = await axios.get(
        `${API}/housekeeping/list`
      );

      const tasks =
        response.data?.data ||
        response.data ||
        [];

      const grouped = {};

      tasks.forEach((task) => {
        const roomId =
          task.roomId?._id ||
          task.roomId;

        if (!roomId) return;

        if (!grouped[roomId]) {
          grouped[roomId] = [];
        }

        grouped[roomId].push(task);
      });

      setHousekeepingTasks(grouped);
    } catch (err) {
      console.error(
        "Housekeeping fetch error:",
        err
      );

      setHousekeepingTasks({});
    }
  };

  // ========================
  // INITIAL FETCH
  // ========================
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        await fetchRooms();
        await fetchHousekeeping();

        if (token && userId) {
          await fetchUserBookings();
        }

        setError("");
      } catch (err) {
        console.error(
          "Fetch Error:",
          err
        );

        setError(
          "Failed to fetch rooms. Is backend running?"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token, userId]);

  // ========================
  // AUTO REFRESH
  // ========================
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        await fetchRooms();
        await fetchHousekeeping();

        if (token && userId) {
          await fetchUserBookings();
        }
      } catch (err) {
        console.error(
          "Auto refresh error:",
          err
        );
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [token, userId]);

  // ========================
  // CHECK EXPIRY
  // ========================
  useEffect(() => {
    if (!token || !userId) return;

    const checkExpiries = async () => {
      try {
        const bookingsRes =
          await axios.get(
            `${API}/booking/guest/${userId}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

        const bookings =
          bookingsRes.data?.data || [];

        for (const booking of bookings) {
          if (
            booking.status === "reserved" &&
            booking.expiresAt
          ) {
            const expiryTime =
              new Date(
                booking.expiresAt
              ).getTime();

            if (Date.now() > expiryTime) {
              try {
                await axios.get(
                  `${API}/booking/expiry-status/${booking._id}`,
                  {
                    headers: {
                      Authorization: `Bearer ${token}`,
                    },
                  }
                );
              } catch (err) {
                console.error(
                  "Expiry status error:",
                  err
                );
              }
            }
          }
        }

        await fetchUserBookings();
        await fetchRooms();
      } catch (err) {
        console.error(
          "Error checking expiries:",
          err
        );
      }
    };

    const interval = setInterval(
      checkExpiries,
      30000
    );

    return () =>
      clearInterval(interval);
  }, [token, userId]);

  // ========================
  // LOCAL TIMER
  // ========================
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();

      let updated = false;

      const newExpiries = {
        ...bookingExpiries,
      };

      Object.keys(newExpiries).forEach(
        (roomId) => {
          if (
            newExpiries[roomId] <= now
          ) {
            delete newExpiries[roomId];
            updated = true;
          }
        }
      );

      if (updated) {
        setBookingExpiries(newExpiries);

        localStorage.setItem(
          "bookingExpiries",
          JSON.stringify(newExpiries)
        );

        fetchRooms();

        if (token && userId) {
          fetchUserBookings();
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [
    bookingExpiries,
    token,
    userId,
  ]);

  // ========================
  // SAVE FAVORITES
  // ========================
  useEffect(() => {
    localStorage.setItem(
      "favoriteRooms",
      JSON.stringify(favorites)
    );
  }, [favorites]);

  // ========================
  // TOGGLE FAVORITE
  // ========================
  const toggleFavorite = (roomId) => {
    setFavorites((prev) => {
      if (prev.includes(roomId)) {
        return prev.filter(
          (id) => id !== roomId
        );
      }

      return [...prev, roomId];
    });
  };

  // ========================
  // ROOM IMAGE
  // ========================
  const getRoomImage = (room) => {
    if (room.image) {
      if (
        room.image.startsWith("http")
      ) {
        return room.image;
      }

      if (
        room.image.startsWith("/")
      ) {
        return `${API}${room.image}`;
      }

      return `${API}/uploads/${room.image}`;
    }

    if (
      room.img &&
      typeof room.img === "string"
    ) {
      if (
        room.img.startsWith("http")
      ) {
        return room.img;
      }

      if (
        room.img.startsWith("/")
      ) {
        return `${API}${room.img}`;
      }

      return `${API}/uploads/${room.img}`;
    }

    return "/images/default-room.jpg";
  };

  // ========================
  // BOOK NOW
  // ========================
  const handleBookNow = async (
    roomId,
    status
  ) => {
    const normalizedStatus = String(
      status || ""
    )
      .trim()
      .toLowerCase();

    if (normalizedStatus !== "available") {
      alert(
        "This room is currently not available for booking."
      );
      return;
    }

    const currentToken =
      localStorage.getItem("token");

    const guestData =
      localStorage.getItem("guest");

    if (!currentToken || !guestData) {
      navigate("/login", {
        state: {
          from: `/booking/${roomId}`,
        },
      });

      return;
    }

    try {
      const checkRes = await axios.get(
        `${API}/booking/check-availability?roomId=${roomId}`
      );

      if (
        checkRes.data?.data &&
        checkRes.data.data.isAvailable === false
      ) {
        alert(
          "This room has a pending booking. Please try again in a few minutes."
        );

        return;
      }
    } catch (err) {
      console.error(
        "Availability check error:",
        err
      );
    }

    navigate(`/booking/${roomId}`, {
      state: {
        roomId,
        startTimer: true,
      },
    });
  };

  // ========================
  // CANCEL BOOKING
  // ========================
  const handleCancelBooking = async (
    roomId
  ) => {
    if (
      !window.confirm(
        "Are you sure you want to cancel this booking? You have 10 minutes from booking time."
      )
    ) {
      return;
    }

    try {
      setLoading(true);

      const response =
        await axios.get(
          `${API}/booking/guest/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

      const bookings =
        response.data?.data || [];

      const booking =
        bookings.find(
          (b) =>
            (
              b.roomId?._id === roomId ||
              b.roomId === roomId
            ) &&
            b.status === "reserved"
        );

      if (!booking) {
        alert("Booking not found!");
        return;
      }

      const now = new Date();

      const expiryTime =
        new Date(
          booking.expiresAt
        );

      if (now > expiryTime) {
        alert(
          "Booking has expired and cannot be cancelled."
        );

        await fetchUserBookings();
        await fetchRooms();

        return;
      }

      await axios.delete(
        `${API}/booking/deletebooking/${booking._id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const newExpiries = {
        ...bookingExpiries,
      };

      delete newExpiries[roomId];

      setBookingExpiries(
        newExpiries
      );

      localStorage.setItem(
        "bookingExpiries",
        JSON.stringify(
          newExpiries
        )
      );

      alert(
        "Booking cancelled successfully!"
      );

      await fetchUserBookings();
      await fetchRooms();
    } catch (err) {
      console.error(
        "Cancel Booking Error:",
        err
      );

      alert(
        err.response?.data
          ?.message ||
          "Failed to cancel booking. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // ========================
  // FORMAT TIMER
  // ========================
  const formatTimeRemaining = (
    expiryTime
  ) => {
    const remaining = Math.max(
      0,
      Math.floor(
        (expiryTime - Date.now()) /
          1000
      )
    );

    if (remaining <= 0) {
      return null;
    }

    const minutes = Math.floor(
      remaining / 60
    );

    const seconds =
      remaining % 60;

    return `${minutes}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };

  // ========================
  // ROOM DISPLAY STATUS
  // ========================
  const getRoomDisplayStatus = (
    room
  ) => {
    const rawStatus = String(
      room?.status || ""
    )
      .trim()
      .toLowerCase();

    const hasActiveTimer = Boolean(
      bookingExpiries[room?._id]
    );

    const isBookedByUser =
      userBookings.includes(
        room?._id
      );

    if (
      rawStatus === "reserved" &&
      hasActiveTimer &&
      isBookedByUser
    ) {
      return "pending";
    }

    if (
      rawStatus === "reserved" &&
      !hasActiveTimer
    ) {
      return "expired";
    }

    return rawStatus || "available";
  };

  // ========================
  // HOUSEKEEPING STATUS
  // ========================
  const getHousekeepingStatus = (
    roomId
  ) => {
    const tasks =
      housekeepingTasks[
        roomId
      ] || [];

    const activeTask =
      tasks.find(
        (task) =>
          task.status ===
            "pending" ||
          task.status ===
            "in-progress"
      );

    if (!activeTask) {
      return {
        active: false,
        status: null,
        label: "Room ready",
      };
    }

    if (
      activeTask.status ===
      "in-progress"
    ) {
      return {
        active: true,
        status: "in-progress",
        label:
          "Cleaning in progress",
      };
    }

    return {
      active: true,
      status: "pending",
      label:
        "Cleaning pending",
    };
  };

  // ========================
  // PRICE RANGE
  // ========================
  const applyPriceRange = (
    min,
    max,
    rangeName
  ) => {
    setMinPrice(
      min !== null
        ? String(min)
        : ""
    );

    setMaxPrice(
      max !== null
        ? String(max)
        : ""
    );

    setSelectedPriceRange(
      rangeName
    );
  };

  // ========================
  // RESET FILTERS
  // ========================
  const resetFilters = () => {
    setMinPrice("");
    setMaxPrice("");
    setSelectedPriceRange("");

    setRoomType("");
    setBedType("");
    setViewType("");

    setSearchText("");
    setSortBy("");
  };

  // ========================
  // PRICE RANGES
  // ========================
  const priceRanges = [
    {
      label: "Under $100",
      min: null,
      max: 100,
    },
    {
      label: "$100 – $200",
      min: 100,
      max: 200,
    },
    {
      label: "$200 – $300",
      min: 200,
      max: 300,
    },
    {
      label: "$300 – $500",
      min: 300,
      max: 500,
    },
    {
      label: "$500+",
      min: 500,
      max: null,
    },
  ];

  // ========================
  // ACTIVE FILTER COUNT
  // ========================
  const activeFilterCount = [
    minPrice,
    maxPrice,
    roomType,
    bedType,
    viewType,
    searchText,
    sortBy,
  ].filter(Boolean).length;

  // ========================
  // FILTER + SORT
  // ========================
  const filteredRooms =
    useMemo(() => {
      let result = [...rooms];

      const min =
        minPrice === ""
          ? 0
          : Number(minPrice);

      const max =
        maxPrice === ""
          ? Infinity
          : Number(maxPrice);

      // PRICE
      result =
        result.filter(
          (room) => {
            const price =
              Number(
                room.pricing
                  ?.pricePerNight
              );

            if (
              isNaN(price)
            ) {
              return false;
            }

            return (
              price >= min &&
              price <= max
            );
          }
        );

      // ROOM TYPE
      if (roomType) {
        result =
          result.filter(
            (room) =>
              String(
                room.roomType ||
                  ""
              ).toLowerCase() ===
              roomType.toLowerCase()
          );
      }

      // BED TYPE
      if (bedType) {
        result =
          result.filter(
            (room) =>
              String(
                room.bedType ||
                  ""
              ).toLowerCase() ===
              bedType.toLowerCase()
          );
      }

      // VIEW
      if (viewType) {
        result =
          result.filter(
            (room) =>
              String(
                room.features
                  ?.view ||
                  ""
              ).toLowerCase() ===
              viewType.toLowerCase()
          );
      }

      // SEARCH
      if (
        searchText.trim()
      ) {
        const search =
          searchText
            .trim()
            .toLowerCase();

        result =
          result.filter(
            (room) => {
              const roomNumber =
                String(
                  room.roomNumber ||
                    ""
                ).toLowerCase();

              const type =
                String(
                  room.roomType ||
                    ""
                ).toLowerCase();

              return (
                roomNumber.includes(
                  search
                ) ||
                type.includes(
                  search
                )
              );
            }
          );
      }

      // SORT LOW TO HIGH
      if (
        sortBy === "low"
      ) {
        result.sort(
          (a, b) =>
            Number(
              a.pricing
                ?.pricePerNight ||
                0
            ) -
            Number(
              b.pricing
                ?.pricePerNight ||
                0
            )
        );
      }

      // SORT HIGH TO LOW
      if (
        sortBy === "high"
      ) {
        result.sort(
          (a, b) =>
            Number(
              b.pricing
                ?.pricePerNight ||
                0
            ) -
            Number(
              a.pricing
                ?.pricePerNight ||
                0
            )
        );
      }

      return result;
    }, [
      rooms,
      minPrice,
      maxPrice,
      roomType,
      bedType,
      viewType,
      searchText,
      sortBy,
    ]);

  // ========================
  // STATUS STYLES
  // ========================
  const statusStyles = {
    available: {
      bg: "rgba(65, 180, 105, 0.14)",
      fg: "#79d99a",
      label: "Available",
    },

    occupied: {
      bg: "rgba(210, 75, 75, 0.14)",
      fg: "#ff8c8c",
      label: "Occupied",
    },

    pending: {
      bg: "rgba(232, 163, 62, 0.16)",
      fg: "#ffcf85",
      label: "Pending Payment",
    },

    expired: {
      bg: "rgba(167, 169, 179, 0.13)",
      fg: "#a7a9b3",
      label: "Booking Expired",
    },

    reserved: {
      bg: "rgba(85, 145, 210, 0.15)",
      fg: "#8fc3f0",
      label: "Reserved",
    },

    cleaning: {
      bg: "rgba(232, 163, 62, 0.14)",
      fg: "#ffcf85",
      label: "Cleaning",
    },

    maintenance: {
      bg: "rgba(167, 169, 179, 0.13)",
      fg: "#a7a9b3",
      label: "Maintenance",
    },
  };

  // ========================
  // ROOM AMENITIES
  // ========================
  const getAmenities = (room) => {
    const amenities =
      room.amenities ||
      room.features?.amenities ||
      [];

    if (Array.isArray(amenities)) {
      return amenities.filter(Boolean);
    }

    if (typeof amenities === "string") {
      return amenities
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
    }

    return [];
  };

  // ========================
  // LOADING
  // ========================
  if (loading) {
    return (
      <section
        style={{
          padding: "120px 24px",
          textAlign: "center",
          minHeight: "100vh",
          boxSizing: "border-box",
          background: "#0d0f14",
          color: "#f4f1ea",
          fontFamily:
            "'Inter', -apple-system, sans-serif",
        }}
      >
        <div
          style={{
            width: "40px",
            height: "40px",
            margin: "0 auto",
            border:
              "3px solid #262b35",
            borderTopColor:
              "#e8a33e",
            borderRadius: "50%",
            animation:
              "rooms-spin 0.8s linear infinite",
          }}
        />

        <p
          style={{
            marginTop: "16px",
            color: "#a7a9b3",
            fontSize: "14px",
          }}
        >
          Loading rooms...
        </p>

        <style>
          {`
            @keyframes rooms-spin {
              to {
                transform: rotate(360deg);
              }
            }
          `}
        </style>
      </section>
    );
  }

  // ========================
  // MAIN UI
  // ========================
  return (
    <div
      style={{
        fontFamily:
          "'Inter', -apple-system, sans-serif",
        color: "#f4f1ea",
        background: "#0d0f14",
        minHeight: "100vh",
      }}
    >
      <style>
        {`
          .rm-book-btn:hover:not(:disabled) {
            background:
              linear-gradient(
                135deg,
                #e8a33e,
                #ffcf85
              ) !important;
            transform: translateY(-2px);
            box-shadow:
              0 8px 22px
              rgba(232,163,62,0.22);
          }

          .rm-cancel-btn:hover:not(:disabled) {
            background:
              #b83d3d !important;
            transform: translateY(-1px);
          }

          .rm-chip {
            transition:
              all 0.2s ease;
          }

          .rm-chip:hover {
            border-color:
              #e8a33e !important;
            color:
              #ffcf85 !important;
          }

          .rm-card {
            transition:
              box-shadow 0.25s ease,
              transform 0.25s ease,
              border-color 0.25s ease;
          }

          .rm-card:hover {
            box-shadow:
              0 18px 40px
              rgba(0,0,0,0.35);
            transform:
              translateY(-4px);
            border-color:
              #3b414d !important;
          }

          .rm-details-btn {
            transition:
              all 0.2s ease;
          }

          .rm-details-btn:hover {
            background:
              #12151c !important;
            border-color:
              #e8a33e !important;
            color:
              #ffcf85 !important;
          }

          .rm-favorite-btn {
            transition:
              transform 0.2s ease,
              background 0.2s ease;
          }

          .rm-favorite-btn:hover {
            transform:
              scale(1.08);
            background:
              rgba(23,27,35,0.96) !important;
          }

          .rm-modal-overlay {
            position: fixed;
            inset: 0;
            background:
              rgba(5,7,10,0.78);
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
            z-index: 9999;
            backdrop-filter:
              blur(7px);
          }

          .rm-modal {
            width: 100%;
            max-width: 900px;
            max-height: 90vh;
            overflow-y: auto;
            background: #171b23;
            color: #f4f1ea;
            border:
              1px solid #262b35;
            border-radius: 16px;
            box-shadow:
              0 30px 80px
              rgba(0,0,0,0.55);
          }

          .rm-layout {
            display: grid;
            grid-template-columns:
              300px 1fr;
            gap: 30px;
            align-items: start;
          }

          .rm-grid {
            display: grid;
            grid-template-columns:
              repeat(3, 1fr);
            gap: 22px;
          }

          .rm-top-controls {
            display: grid;
            grid-template-columns:
              1fr 220px;
            gap: 14px;
            margin-bottom: 28px;
          }

          .rm-search-input::placeholder {
            color: #727783;
          }

          .rm-search-input:focus,
          .rm-filter-select:focus,
          .rm-price-input:focus {
            border-color:
              #e8a33e !important;
            box-shadow:
              0 0 0 3px
              rgba(232,163,62,0.08);
          }

          .rm-filter-select option {
            background:
              #171b23;
            color:
              #f4f1ea;
          }

          @media (max-width: 1200px) {
            .rm-layout {
              grid-template-columns:
                260px 1fr;
            }

            .rm-grid {
              grid-template-columns:
                repeat(2, 1fr);
            }
          }

          @media (max-width: 900px) {
            .rm-layout {
              grid-template-columns:
                1fr;
            }

            .rm-top-controls {
              grid-template-columns:
                1fr;
            }

            .rm-grid {
              grid-template-columns:
                repeat(2, 1fr);
            }
          }

          @media (max-width: 560px) {
            .rm-grid {
              grid-template-columns:
                1fr;
            }

            .rm-modal {
              max-height: 95vh;
              border-radius: 12px;
            }
          }
        `}
      </style>

      {/* ========================
          HERO
      ======================== */}
      <div
        style={{
          backgroundImage:
            "linear-gradient(180deg, rgba(8,9,12,0.72), rgba(8,9,12,0.72)), url('/images/LuxeryRoom.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          padding: "96px 24px",
          textAlign: "center",
          color: "#f4f1ea",
          height: "700px",
          boxSizing: "border-box",
        }}
      >
        <p
          style={{
            fontSize: "13px",
            letterSpacing: "0.08em",
            color: "#ffcf85",
            marginBottom: "14px",
          }}
        >
          Home &nbsp;/&nbsp; Rooms
        </p>

        <h1
          style={{
            fontFamily:
              "Georgia, 'Times New Roman', serif",
            fontSize: "46px",
            fontWeight: "500",
            margin: 0,
            color: "#f4f1ea",
          }}
        >
          Our Rooms{" "}
          <span
            style={{
              color: "#e8a33e",
            }}
          >
            &amp; Suites
          </span>
        </h1>

        <p
          style={{
            marginTop: "14px",
            fontSize: "16px",
            color: "#d2d0ca",
          }}
        >
          Find a room that fits
          your stay, your budget,
          your pace.
        </p>
      </div>

      {/* ========================
          CONTENT
      ======================== */}
      <section
        style={{
          padding:
            "56px 24px 90px",
          background: "#0d0f14",
        }}
      >
        <div
          style={{
            maxWidth: "1280px",
            margin: "0 auto",
          }}
        >
          {/* ERROR */}
          {error && (
            <div
              style={{
                background:
                  "rgba(194,59,52,0.12)",
                border:
                  "1px solid rgba(194,59,52,0.35)",
                color: "#ff9b96",
                padding:
                  "14px 18px",
                borderRadius: "8px",
                marginBottom: "28px",
                fontSize: "14px",
              }}
            >
              {error}
            </div>
          )}

          {/* ========================
              SEARCH + SORT
          ======================== */}
          <div className="rm-top-controls">
            <input
              className="rm-search-input"
              type="text"
              placeholder="Search room number or room type..."
              value={searchText}
              onChange={(e) =>
                setSearchText(
                  e.target.value
                )
              }
              style={{
                width: "100%",
                boxSizing: "border-box",
                padding:
                  "14px 16px",
                border:
                  "1px solid #262b35",
                borderRadius: "8px",
                background:
                  "#12151c",
                color: "#f4f1ea",
                outline: "none",
                fontSize: "14px",
                transition:
                  "all 0.2s ease",
              }}
            />

            <select
              className="rm-filter-select"
              value={sortBy}
              onChange={(e) =>
                setSortBy(
                  e.target.value
                )
              }
              style={{
                padding:
                  "14px 16px",
                border:
                  "1px solid #262b35",
                borderRadius: "8px",
                background:
                  "#12151c",
                color: "#f4f1ea",
                fontSize: "14px",
                outline: "none",
                transition:
                  "all 0.2s ease",
              }}
            >
              <option value="">
                Sort rooms
              </option>

              <option value="low">
                Price: Low to High
              </option>

              <option value="high">
                Price: High to Low
              </option>
            </select>
          </div>

          {/* ACTIVE FILTER SUMMARY */}
          <div
            style={{
              display: "flex",
              justifyContent:
                "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "10px",
              marginBottom: "24px",
            }}
          >
            <div
              style={{
                fontSize: "13px",
                color: "#a7a9b3",
              }}
            >
              {activeFilterCount > 0 ? (
                <>
                  <strong
                    style={{
                      color: "#e8a33e",
                    }}
                  >
                    {activeFilterCount}
                  </strong>{" "}
                  active filter
                  {activeFilterCount !== 1
                    ? "s"
                    : ""}
                </>
              ) : (
                "All rooms"
              )}
            </div>

            {favorites.length > 0 && (
              <div
                style={{
                  padding:
                    "7px 12px",
                  borderRadius:
                    "20px",
                  background:
                    "rgba(232,163,62,0.10)",
                  border:
                    "1px solid rgba(232,163,62,0.22)",
                  color:
                    "#ffcf85",
                  fontSize: "12px",
                  fontWeight: "700",
                }}
              >
                ♥ {favorites.length}{" "}
                favorite
                {favorites.length !== 1
                  ? "s"
                  : ""}
              </div>
            )}
          </div>

          <div className="rm-layout">

            {/* ========================
                FILTER SIDEBAR
            ======================== */}
            <aside
              style={{
                position: "sticky",
                top: "24px",
              }}
            >
              <div
                style={{
                  border:
                    "1px solid #262b35",
                  borderRadius:
                    "12px",
                  backgroundColor:
                    "#171b23",
                  overflow:
                    "hidden",
                  boxShadow:
                    "0 12px 30px rgba(0,0,0,0.20)",
                }}
              >
                <div
                  style={{
                    background:
                      "linear-gradient(135deg, #ffcf85 0%, #e8a33e 100%)",
                    padding:
                      "22px 24px",
                    color:
                      "#2b2417",
                  }}
                >
                  <h3
                    style={{
                      margin:
                        "0 0 5px",
                      fontFamily:
                        "Georgia, 'Times New Roman', serif",
                      fontSize:
                        "20px",
                      fontWeight:
                        "500",
                    }}
                  >
                    Room Filters
                  </h3>

                  <p
                    style={{
                      margin: 0,
                      fontSize:
                        "13px",
                      color:
                        "#594321",
                    }}
                  >
                    Find the room
                    you need.
                  </p>
                </div>

                <div
                  style={{
                    padding:
                      "22px",
                  }}
                >
                  {/* PRICE */}
                  <span
                    style={{
                      display:
                        "block",
                      fontSize:
                        "12px",
                      fontWeight:
                        "700",
                      color:
                        "#a7a9b3",
                      marginBottom:
                        "13px",
                      letterSpacing:
                        "0.04em",
                    }}
                  >
                    PRICE
                  </span>

                  <div
                    style={{
                      display:
                        "flex",
                      flexDirection:
                        "column",
                      gap: "8px",
                      marginBottom:
                        "22px",
                    }}
                  >
                    {priceRanges.map(
                      (range) => {
                        const active =
                          selectedPriceRange ===
                          range.label;

                        return (
                          <button
                            key={
                              range.label
                            }
                            className="rm-chip"
                            onClick={() =>
                              applyPriceRange(
                                range.min,
                                range.max,
                                range.label
                              )
                            }
                            style={{
                              display:
                                "flex",
                              justifyContent:
                                "space-between",
                              padding:
                                "11px 13px",
                              border:
                                active
                                  ? "1px solid #e8a33e"
                                  : "1px solid #262b35",
                              borderRadius:
                                "8px",
                              backgroundColor:
                                active
                                  ? "rgba(232,163,62,0.10)"
                                  : "#12151c",
                              color:
                                active
                                  ? "#ffcf85"
                                  : "#a7a9b3",
                              fontWeight:
                                active
                                  ? "700"
                                  : "500",
                              cursor:
                                "pointer",
                              textAlign:
                                "left",
                            }}
                          >
                            {range.label}

                            {active && (
                              <span
                                style={{
                                  color:
                                    "#e8a33e",
                                }}
                              >
                                ✓
                              </span>
                            )}
                          </button>
                        );
                      }
                    )}
                  </div>

                  {/* CUSTOM PRICE */}
                  <div
                    style={{
                      display:
                        "flex",
                      gap: "8px",
                      marginBottom:
                        "22px",
                    }}
                  >
                    <input
                      className="rm-price-input"
                      type="number"
                      min="0"
                      placeholder="Min"
                      value={minPrice}
                      onChange={(e) => {
                        setMinPrice(
                          e.target.value
                        );

                        setSelectedPriceRange(
                          ""
                        );
                      }}
                      style={{
                        width: "50%",
                        padding:
                          "11px",
                        border:
                          "1px solid #262b35",
                        borderRadius:
                          "7px",
                        outline: "none",
                        boxSizing:
                          "border-box",
                        background:
                          "#12151c",
                        color:
                          "#f4f1ea",
                      }}
                    />

                    <input
                      className="rm-price-input"
                      type="number"
                      min="0"
                      placeholder="Max"
                      value={maxPrice}
                      onChange={(e) => {
                        setMaxPrice(
                          e.target.value
                        );

                        setSelectedPriceRange(
                          ""
                        );
                      }}
                      style={{
                        width: "50%",
                        padding:
                          "11px",
                        border:
                          "1px solid #262b35",
                        borderRadius:
                          "7px",
                        outline: "none",
                        boxSizing:
                          "border-box",
                        background:
                          "#12151c",
                        color:
                          "#f4f1ea",
                      }}
                    />
                  </div>

                  {/* ROOM TYPE */}
                  <label
                    style={{
                      display:
                        "block",
                      fontSize:
                        "12px",
                      fontWeight:
                        "700",
                      color:
                        "#a7a9b3",
                      marginBottom:
                        "8px",
                    }}
                  >
                    ROOM TYPE
                  </label>

                  <select
                    className="rm-filter-select"
                    value={
                      roomType
                    }
                    onChange={(e) =>
                      setRoomType(
                        e.target.value
                      )
                    }
                    style={{
                      width: "100%",
                      padding:
                        "11px",
                      border:
                        "1px solid #262b35",
                      borderRadius:
                        "7px",
                      marginBottom:
                        "18px",
                      background:
                        "#12151c",
                      color:
                        "#f4f1ea",
                      outline: "none",
                    }}
                  >
                    <option value="">
                      All room types
                    </option>

                    <option value="standard">
                      Standard
                    </option>

                    <option value="single">
                      Single
                    </option>

                    <option value="double">
                      Double
                    </option>

                    <option value="deluxe">
                      Deluxe
                    </option>

                    <option value="suite">
                      Suite
                    </option>

                    <option value="executive">
                      Executive
                    </option>
                  </select>

                  {/* BED TYPE */}
                  <label
                    style={{
                      display:
                        "block",
                      fontSize:
                        "12px",
                      fontWeight:
                        "700",
                      color:
                        "#a7a9b3",
                      marginBottom:
                        "8px",
                    }}
                  >
                    BED TYPE
                  </label>

                  <select
                    className="rm-filter-select"
                    value={
                      bedType
                    }
                    onChange={(e) =>
                      setBedType(
                        e.target.value
                      )
                    }
                    style={{
                      width: "100%",
                      padding:
                        "11px",
                      border:
                        "1px solid #262b35",
                      borderRadius:
                        "7px",
                      marginBottom:
                        "18px",
                      background:
                        "#12151c",
                      color:
                        "#f4f1ea",
                      outline: "none",
                    }}
                  >
                    <option value="">
                      All bed types
                    </option>

                    <option value="twin">
                      Twin
                    </option>

                    <option value="full">
                      Full
                    </option>

                    <option value="queen">
                      Queen
                    </option>

                    <option value="king">
                      King
                    </option>

                    <option value="double">
                      Double
                    </option>
                  </select>

                  {/* VIEW */}
                  <label
                    style={{
                      display:
                        "block",
                      fontSize:
                        "12px",
                      fontWeight:
                        "700",
                      color:
                        "#a7a9b3",
                      marginBottom:
                        "8px",
                    }}
                  >
                    VIEW
                  </label>

                  <select
                    className="rm-filter-select"
                    value={
                      viewType
                    }
                    onChange={(e) =>
                      setViewType(
                        e.target.value
                      )
                    }
                    style={{
                      width: "100%",
                      padding:
                        "11px",
                      border:
                        "1px solid #262b35",
                      borderRadius:
                        "7px",
                      marginBottom:
                        "20px",
                      background:
                        "#12151c",
                      color:
                        "#f4f1ea",
                      outline: "none",
                    }}
                  >
                    <option value="">
                      All views
                    </option>

                    <option value="city">
                      City
                    </option>

                    <option value="ocean">
                      Ocean
                    </option>

                    <option value="garden">
                      Garden
                    </option>

                    <option value="mountain">
                      Mountain
                    </option>

                    <option value="pool">
                      Pool
                    </option>
                  </select>

                  {/* FAVORITES */}
                  <div
                    style={{
                      display:
                        "flex",
                      justifyContent:
                        "space-between",
                      alignItems:
                        "center",
                      padding:
                        "11px 12px",
                      background:
                        "#12151c",
                      border:
                        "1px solid #262b35",
                      borderRadius:
                        "7px",
                      marginBottom:
                        "12px",
                    }}
                  >
                    <span
                      style={{
                        fontSize:
                          "13px",
                        color:
                          "#a7a9b3",
                      }}
                    >
                      ♥ Saved rooms
                    </span>

                    <strong
                      style={{
                        color:
                          "#ffcf85",
                      }}
                    >
                      {
                        favorites.length
                      }
                    </strong>
                  </div>

                  {/* CLEAR ALL */}
                  <button
                    onClick={
                      resetFilters
                    }
                    style={{
                      width:
                        "100%",
                      padding:
                        "12px",
                      border:
                        "1px solid rgba(232,163,62,0.35)",
                      borderRadius:
                        "7px",
                      background:
                        "rgba(232,163,62,0.10)",
                      color:
                        "#ffcf85",
                      fontWeight:
                        "700",
                      cursor:
                        "pointer",
                      transition:
                        "all 0.2s ease",
                    }}
                  >
                    Clear all filters
                  </button>
                </div>
              </div>
            </aside>

            {/* ========================
                ROOMS
            ======================== */}
            <div>
              <div
                style={{
                  display:
                    "flex",
                  justifyContent:
                    "space-between",
                  alignItems:
                    "baseline",
                  marginBottom:
                    "22px",
                  flexWrap:
                    "wrap",
                  gap: "8px",
                }}
              >
                <h2
                  style={{
                    fontFamily:
                      "Georgia, 'Times New Roman', serif",
                    fontSize:
                      "24px",
                    fontWeight:
                      "500",
                    margin: 0,
                    color:
                      "#f4f1ea",
                  }}
                >
                  Available Rooms
                </h2>

                <span
                  style={{
                    fontSize:
                      "14px",
                    color:
                      "#a7a9b3",
                  }}
                >
                  Showing{" "}
                  <strong
                    style={{
                      color:
                        "#e8a33e",
                    }}
                  >
                    {
                      filteredRooms.length
                    }
                  </strong>{" "}
                  of{" "}
                  <strong
                    style={{
                      color:
                        "#f4f1ea",
                    }}
                  >
                    {rooms.length}
                  </strong>{" "}
                  rooms
                </span>
              </div>

              {/* EMPTY */}
              {filteredRooms.length ===
              0 ? (
                <div
                  style={{
                    textAlign:
                      "center",
                    padding:
                      "70px 20px",
                    border:
                      "1px dashed #363c47",
                    borderRadius:
                      "10px",
                    background:
                      "#171b23",
                  }}
                >
                  <div
                    style={{
                      fontSize:
                        "40px",
                      marginBottom:
                        "14px",
                    }}
                  >
                    🛏️
                  </div>

                  <h3
                    style={{
                      margin:
                        "0 0 8px",
                      fontFamily:
                        "Georgia, serif",
                      fontWeight:
                        "500",
                      color:
                        "#f4f1ea",
                    }}
                  >
                    No rooms found
                  </h3>

                  <p
                    style={{
                      color:
                        "#a7a9b3",
                      marginBottom:
                        "22px",
                      fontSize:
                        "14px",
                    }}
                  >
                    Try changing
                    your filters.
                  </p>

                  <button
                    onClick={
                      resetFilters
                    }
                    style={{
                      padding:
                        "10px 22px",
                      background:
                        "linear-gradient(135deg, #ffcf85, #e8a33e)",
                      color:
                        "#2b2417",
                      border:
                        "none",
                      borderRadius:
                        "6px",
                      cursor:
                        "pointer",
                      fontWeight:
                        "700",
                    }}
                  >
                    Clear filters
                  </button>
                </div>
              ) : (
                <div className="rm-grid">
                  {filteredRooms.map(
                    (room) => {
                      const isBookedByUser =
                        userBookings.includes(
                          room._id
                        );

                      const hasActiveTimer =
                        bookingExpiries[
                          room._id
                        ];

                      const timeRemaining =
                        hasActiveTimer
                          ? formatTimeRemaining(
                              bookingExpiries[
                                room._id
                              ]
                            )
                          : null;

                      const displayStatus =
                        getRoomDisplayStatus(
                          room
                        );

                      const statusStyle =
                        statusStyles[
                          displayStatus
                        ] ||
                        statusStyles.reserved;

                      const housekeeping =
                        getHousekeepingStatus(
                          room._id
                        );

                      const isFavorite =
                        favorites.includes(
                          room._id
                        );

                      const amenities =
                        getAmenities(room);

                      return (
                        <div
                          key={
                            room._id
                          }
                          className="rm-card"
                          style={{
                            border:
                              "1px solid #262b35",
                            borderRadius:
                              "12px",
                            overflow:
                              "hidden",
                            background:
                              "#171b23",
                          }}
                        >
                          {/* IMAGE */}
                          <div
                            style={{
                              position:
                                "relative",
                            }}
                          >
                            <img
                              src={getRoomImage(
                                room
                              )}
                              alt={
                                room.roomNumber ||
                                "Room"
                              }
                              style={{
                                width:
                                  "100%",
                                height:
                                  "190px",
                                objectFit:
                                  "cover",
                                display:
                                  "block",
                              }}
                              onError={(
                                e
                              ) => {
                                e.target.onerror =
                                  null;

                                e.target.src =
                                  "/images/default-room.jpg";
                              }}
                            />

                            {/* STATUS */}
                            <span
                              style={{
                                position:
                                  "absolute",
                                top:
                                  "12px",
                                right:
                                  "12px",
                                padding:
                                  "5px 12px",
                                borderRadius:
                                  "20px",
                                fontSize:
                                  "12px",
                                fontWeight:
                                  "700",
                                backgroundColor:
                                  statusStyle.bg,
                                color:
                                  statusStyle.fg,
                                border:
                                  "1px solid rgba(255,255,255,0.08)",
                                backdropFilter:
                                  "blur(5px)",
                              }}
                            >
                              {
                                statusStyle.label
                              }
                            </span>

                            {/* FAVORITE */}
                            <button
                              type="button"
                              className="rm-favorite-btn"
                              onClick={() =>
                                toggleFavorite(
                                  room._id
                                )
                              }
                              aria-label={
                                isFavorite
                                  ? "Remove from favorites"
                                  : "Add to favorites"
                              }
                              style={{
                                position:
                                  "absolute",
                                top:
                                  "10px",
                                left:
                                  "10px",
                                width:
                                  "38px",
                                height:
                                  "38px",
                                border:
                                  "1px solid rgba(255,255,255,0.15)",
                                borderRadius:
                                  "50%",
                                background:
                                  "rgba(8,9,12,0.75)",
                                color:
                                  isFavorite
                                    ? "#e8a33e"
                                    : "#f4f1ea",
                                fontSize:
                                  "19px",
                                cursor:
                                  "pointer",
                                display:
                                  "flex",
                                alignItems:
                                  "center",
                                justifyContent:
                                  "center",
                                boxShadow:
                                  "0 4px 15px rgba(0,0,0,0.25)",
                                backdropFilter:
                                  "blur(5px)",
                              }}
                            >
                              {isFavorite
                                ? "♥"
                                : "♡"}
                            </button>
                          </div>

                          {/* DETAILS */}
                          <div
                            style={{
                              padding:
                                "18px",
                            }}
                          >
                            <h3
                              style={{
                                margin:
                                  "0 0 5px",
                                fontFamily:
                                  "Georgia, 'Times New Roman', serif",
                                fontSize:
                                  "18px",
                                fontWeight:
                                  "500",
                                textTransform:
                                  "capitalize",
                                color:
                                  "#f4f1ea",
                              }}
                            >
                              {
                                room.roomNumber
                              }{" "}
                              —{" "}
                              {
                                room.roomType
                              }
                            </h3>

                            {/* PRICE */}
                            <p
                              style={{
                                margin:
                                  "0 0 14px",
                                fontSize:
                                  "14px",
                                color:
                                  "#a7a9b3",
                              }}
                            >
                              <strong
                                style={{
                                  color:
                                    "#e8a33e",
                                  fontSize:
                                    "20px",
                                }}
                              >
                                $
                                {
                                  room
                                    .pricing
                                    ?.pricePerNight ??
                                  "N/A"
                                }
                              </strong>{" "}
                              / night
                            </p>

                            {/* FEATURES */}
                            <div
                              style={{
                                display:
                                  "flex",
                                flexWrap:
                                  "wrap",
                                gap:
                                  "6px",
                                marginBottom:
                                  "14px",
                              }}
                            >
                              {room.bedType && (
                                <span
                                  style={{
                                    background:
                                      "#12151c",
                                    border:
                                      "1px solid #262b35",
                                    color:
                                      "#a7a9b3",
                                    padding:
                                      "5px 8px",
                                    borderRadius:
                                      "5px",
                                    fontSize:
                                      "11px",
                                  }}
                                >
                                  🛏️{" "}
                                  {
                                    room.bedType
                                  }
                                </span>
                              )}

                              {room.features
                                ?.view && (
                                <span
                                  style={{
                                    background:
                                      "#12151c",
                                    border:
                                      "1px solid #262b35",
                                    color:
                                      "#a7a9b3",
                                    padding:
                                      "5px 8px",
                                    borderRadius:
                                      "5px",
                                    fontSize:
                                      "11px",
                                  }}
                                >
                                  🌆{" "}
                                  {
                                    room
                                      .features
                                      .view
                                  }
                                </span>
                              )}

                              {room.features
                                ?.size && (
                                <span
                                  style={{
                                    background:
                                      "#12151c",
                                    border:
                                      "1px solid #262b35",
                                    color:
                                      "#a7a9b3",
                                    padding:
                                      "5px 8px",
                                    borderRadius:
                                      "5px",
                                    fontSize:
                                      "11px",
                                  }}
                                >
                                  📐{" "}
                                  {
                                    room
                                      .features
                                      .size
                                  }{" "}
                                  sqm
                                </span>
                              )}

                              {room.floor && (
                                <span
                                  style={{
                                    background:
                                      "#12151c",
                                    border:
                                      "1px solid #262b35",
                                    color:
                                      "#a7a9b3",
                                    padding:
                                      "5px 8px",
                                    borderRadius:
                                      "5px",
                                    fontSize:
                                      "11px",
                                  }}
                                >
                                  🏢 Floor{" "}
                                  {
                                    room.floor
                                  }
                                </span>
                              )}

                              {room.features
                                ?.balcony && (
                                <span
                                  style={{
                                    background:
                                      "rgba(65,180,105,0.10)",
                                    border:
                                      "1px solid rgba(65,180,105,0.20)",
                                    color:
                                      "#79d99a",
                                    padding:
                                      "5px 8px",
                                    borderRadius:
                                      "5px",
                                    fontSize:
                                      "11px",
                                  }}
                                >
                                  🌿 Balcony
                                </span>
                              )}

                              {amenities
                                .slice(0, 2)
                                .map(
                                  (
                                    amenity,
                                    index
                                  ) => (
                                    <span
                                      key={`${room._id}-amenity-${index}`}
                                      style={{
                                        background:
                                          "rgba(232,163,62,0.08)",
                                        border:
                                          "1px solid rgba(232,163,62,0.18)",
                                        color:
                                          "#ffcf85",
                                        padding:
                                          "5px 8px",
                                        borderRadius:
                                          "5px",
                                        fontSize:
                                          "11px",
                                      }}
                                    >
                                      ✦{" "}
                                      {
                                        amenity
                                      }
                                    </span>
                                  )
                                )}
                            </div>

                            {/* HOUSEKEEPING */}
                            <div
                              style={{
                                padding:
                                  "10px 11px",
                                borderRadius:
                                  "7px",
                                background:
                                  housekeeping.active
                                    ? "rgba(232,163,62,0.08)"
                                    : "rgba(65,180,105,0.08)",
                                border:
                                  housekeeping.active
                                    ? "1px solid rgba(232,163,62,0.18)"
                                    : "1px solid rgba(65,180,105,0.18)",
                                color:
                                  housekeeping.active
                                    ? "#ffcf85"
                                    : "#79d99a",
                                fontSize:
                                  "12px",
                                fontWeight:
                                  "600",
                                marginBottom:
                                  "14px",
                              }}
                            >
                              {housekeeping.active
                                ? `🧹 ${housekeeping.label}`
                                : "✨ Room ready"}
                            </div>

                            {/* DESCRIPTION */}
                            {room.description && (
                              <p
                                style={{
                                  margin:
                                    "0 0 15px",
                                  fontSize:
                                    "13px",
                                  color:
                                    "#a7a9b3",
                                  lineHeight:
                                    "1.5",
                                  display:
                                    "-webkit-box",
                                  WebkitLineClamp:
                                    2,
                                  WebkitBoxOrient:
                                    "vertical",
                                  overflow:
                                    "hidden",
                                }}
                              >
                                {
                                  room.description
                                }
                              </p>
                            )}

                            {/* VIEW DETAILS */}
                            <button
                              type="button"
                              className="rm-details-btn"
                              onClick={() =>
                                setSelectedRoom(
                                  room
                                )
                              }
                              style={{
                                width:
                                  "100%",
                                padding:
                                  "10px",
                                background:
                                  "#12151c",
                                color:
                                  "#ffcf85",
                                border:
                                  "1px solid #262b35",
                                borderRadius:
                                  "6px",
                                fontSize:
                                  "14px",
                                fontWeight:
                                  "600",
                                cursor:
                                  "pointer",
                                marginBottom:
                                  "9px",
                              }}
                            >
                              View room details
                            </button>

                            {/* ========================
                                BOOKING BUTTON
                            ======================== */}
                            {isBookedByUser &&
                            displayStatus ===
                              "pending" ? (
                              <>
                                <button
                                  className="rm-cancel-btn"
                                  onClick={() =>
                                    handleCancelBooking(
                                      room._id
                                    )
                                  }
                                  disabled={
                                    loading
                                  }
                                  style={{
                                    width:
                                      "100%",
                                    padding:
                                      "11px",
                                    background:
                                      "#9f3838",
                                    color:
                                      "#fff",
                                    border:
                                      "none",
                                    borderRadius:
                                      "6px",
                                    fontSize:
                                      "15px",
                                    fontWeight:
                                      "600",
                                    cursor:
                                      loading
                                        ? "not-allowed"
                                        : "pointer",
                                    opacity:
                                      loading
                                        ? 0.7
                                        : 1,
                                    transition:
                                      "all 0.2s ease",
                                  }}
                                >
                                  {loading
                                    ? "Processing..."
                                    : "Cancel booking"}
                                </button>

                                {timeRemaining && (
                                  <div
                                    style={{
                                      fontSize:
                                        "13px",
                                      color:
                                        "#ffcf85",
                                      fontWeight:
                                        "600",
                                      marginTop:
                                        "10px",
                                      textAlign:
                                        "center",
                                    }}
                                  >
                                    ⏳ Time
                                    remaining:{" "}
                                    {
                                      timeRemaining
                                    }
                                  </div>
                                )}
                              </>
                            ) : isBookedByUser &&
                              displayStatus ===
                                "expired" ? (
                              <div
                                style={{
                                  padding:
                                    "11px",
                                  background:
                                    "#12151c",
                                  border:
                                    "1px solid #262b35",
                                  color:
                                    "#a7a9b3",
                                  borderRadius:
                                    "6px",
                                  fontSize:
                                    "14px",
                                  fontWeight:
                                    "600",
                                  textAlign:
                                    "center",
                                }}
                              >
                                Booking expired
                              </div>
                            ) : (
                              <button
                                className="rm-book-btn"
                                disabled={
                                  displayStatus !==
                                  "available"
                                }
                                onClick={() =>
                                  handleBookNow(
                                    room._id,
                                    room.status
                                  )
                                }
                                style={{
                                  width:
                                    "100%",
                                  padding:
                                    "11px",
                                  background:
                                    displayStatus ===
                                    "available"
                                      ? "linear-gradient(135deg, #ffcf85, #e8a33e)"
                                      : "#262b35",
                                  color:
                                    displayStatus ===
                                    "available"
                                      ? "#2b2417"
                                      : "#727783",
                                  border:
                                    "none",
                                  borderRadius:
                                    "6px",
                                  fontSize:
                                    "15px",
                                  fontWeight:
                                    "700",
                                  cursor:
                                    displayStatus ===
                                    "available"
                                      ? "pointer"
                                      : "not-allowed",
                                  transition:
                                    "all 0.2s ease",
                                }}
                              >
                                {displayStatus ===
                                "available"
                                  ? "Book now"
                                  : "Not available"}
                              </button>
                            )}

                            {/* STATUS MESSAGE */}
                            {displayStatus !==
                              "available" &&
                              !isBookedByUser && (
                                <p
                                  style={{
                                    marginTop:
                                      "10px",
                                    fontSize:
                                      "13px",
                                    color:
                                      "#7f838d",
                                    lineHeight:
                                      "1.5",
                                  }}
                                >
                                  {displayStatus ===
                                    "occupied" &&
                                    "Currently occupied."}

                                  {displayStatus ===
                                    "cleaning" &&
                                    "Being cleaned right now."}

                                  {displayStatus ===
                                    "maintenance" &&
                                    "Under maintenance."}

                                  {displayStatus ===
                                    "reserved" &&
                                    "Reserved by another guest."}

                                  {displayStatus ===
                                    "pending" &&
                                    "This room has a pending payment."}

                                  {displayStatus ===
                                    "expired" &&
                                    "Previous booking expired — try again."}
                                </p>
                              )}
                          </div>
                        </div>
                      );
                    }
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          ROOM DETAILS MODAL
      ===================================================== */}
      {selectedRoom && (
        <div
          className="rm-modal-overlay"
          onClick={(e) => {
            if (
              e.target ===
              e.currentTarget
            ) {
              setSelectedRoom(null);
            }
          }}
        >
          <div className="rm-modal">

            {/* MODAL HEADER IMAGE */}
            <div
              style={{
                position:
                  "relative",
              }}
            >
              <img
                src={getRoomImage(
                  selectedRoom
                )}
                alt={
                  selectedRoom.roomNumber ||
                  "Room"
                }
                style={{
                  width:
                    "100%",
                  height:
                    "320px",
                  objectFit:
                    "cover",
                  display:
                    "block",
                }}
                onError={(e) => {
                  e.target.onerror =
                    null;
                  e.target.src =
                    "/images/default-room.jpg";
                }}
              />

              <button
                type="button"
                onClick={() =>
                  setSelectedRoom(null)
                }
                style={{
                  position:
                    "absolute",
                  top:
                    "16px",
                  right:
                    "16px",
                  width:
                    "40px",
                  height:
                    "40px",
                  border:
                    "1px solid rgba(255,255,255,0.12)",
                  borderRadius:
                    "50%",
                  background:
                    "rgba(8,9,12,0.78)",
                  color:
                    "#f4f1ea",
                  fontSize:
                    "22px",
                  cursor:
                    "pointer",
                  boxShadow:
                    "0 4px 15px rgba(0,0,0,0.35)",
                }}
              >
                ×
              </button>

              <div
                style={{
                  position:
                    "absolute",
                  bottom:
                    "16px",
                  left:
                    "18px",
                  background:
                    "linear-gradient(135deg, #ffcf85, #e8a33e)",
                  color:
                    "#2b2417",
                  padding:
                    "7px 12px",
                  borderRadius:
                    "20px",
                  fontSize:
                    "12px",
                  fontWeight:
                    "700",
                  textTransform:
                    "capitalize",
                }}
              >
                {selectedRoom.roomType ||
                  "Room"}
              </div>
            </div>

            {/* MODAL CONTENT */}
            <div
              style={{
                padding:
                  "26px",
              }}
            >
              <div
                style={{
                  display:
                    "flex",
                  justifyContent:
                    "space-between",
                  alignItems:
                    "flex-start",
                  gap:
                    "20px",
                  flexWrap:
                    "wrap",
                  marginBottom:
                    "20px",
                }}
              >
                <div>
                  <p
                    style={{
                      margin:
                        "0 0 5px",
                      fontSize:
                        "12px",
                      color:
                        "#e8a33e",
                      fontWeight:
                        "700",
                      letterSpacing:
                        "0.08em",
                    }}
                  >
                    ROOM DETAILS
                  </p>

                  <h2
                    style={{
                      margin:
                        "0 0 7px",
                      fontFamily:
                        "Georgia, serif",
                      fontWeight:
                        "500",
                      fontSize:
                        "28px",
                      color:
                        "#f4f1ea",
                    }}
                  >
                    {selectedRoom.roomNumber}{" "}
                    —{" "}
                    {selectedRoom.roomType}
                  </h2>

                  {selectedRoom.description && (
                    <p
                      style={{
                        margin: 0,
                        color:
                          "#a7a9b3",
                        fontSize:
                          "14px",
                        lineHeight:
                          "1.7",
                        maxWidth:
                          "650px",
                      }}
                    >
                      {
                        selectedRoom.description
                      }
                    </p>
                  )}
                </div>

                <div
                  style={{
                    textAlign:
                      "right",
                  }}
                >
                  <div
                    style={{
                      fontSize:
                        "28px",
                      fontWeight:
                        "700",
                      color:
                        "#e8a33e",
                    }}
                  >
                    $
                    {selectedRoom
                      .pricing
                      ?.pricePerNight ??
                      "N/A"}
                  </div>

                  <div
                    style={{
                      fontSize:
                        "12px",
                      color:
                        "#a7a9b3",
                    }}
                  >
                    per night
                  </div>
                </div>
              </div>

              {/* ROOM INFORMATION */}
              <div
                style={{
                  display:
                    "grid",
                  gridTemplateColumns:
                    "repeat(auto-fit, minmax(150px, 1fr))",
                  gap:
                    "12px",
                  marginBottom:
                    "24px",
                }}
              >
                {selectedRoom.bedType && (
                  <div
                    style={{
                      padding:
                        "14px",
                      background:
                        "#12151c",
                      border:
                        "1px solid #262b35",
                      borderRadius:
                        "9px",
                    }}
                  >
                    <div
                      style={{
                        fontSize:
                          "11px",
                        color:
                          "#a7a9b3",
                        fontWeight:
                          "700",
                        marginBottom:
                          "5px",
                      }}
                    >
                      BED TYPE
                    </div>

                    <strong
                      style={{
                        textTransform:
                          "capitalize",
                        color:
                          "#f4f1ea",
                      }}
                    >
                      🛏️{" "}
                      {
                        selectedRoom.bedType
                      }
                    </strong>
                  </div>
                )}

                {selectedRoom.features
                  ?.view && (
                  <div
                    style={{
                      padding:
                        "14px",
                      background:
                        "#12151c",
                      border:
                        "1px solid #262b35",
                      borderRadius:
                        "9px",
                    }}
                  >
                    <div
                      style={{
                        fontSize:
                          "11px",
                        color:
                          "#a7a9b3",
                        fontWeight:
                          "700",
                        marginBottom:
                          "5px",
                      }}
                    >
                      VIEW
                    </div>

                    <strong
                      style={{
                        textTransform:
                          "capitalize",
                        color:
                          "#f4f1ea",
                      }}
                    >
                      🌆{" "}
                      {
                        selectedRoom
                          .features
                          .view
                      }
                    </strong>
                  </div>
                )}

                {selectedRoom.features
                  ?.size && (
                  <div
                    style={{
                      padding:
                        "14px",
                      background:
                        "#12151c",
                      border:
                        "1px solid #262b35",
                      borderRadius:
                        "9px",
                    }}
                  >
                    <div
                      style={{
                        fontSize:
                          "11px",
                        color:
                          "#a7a9b3",
                        fontWeight:
                          "700",
                        marginBottom:
                          "5px",
                      }}
                    >
                      ROOM SIZE
                    </div>

                    <strong
                      style={{
                        color:
                          "#f4f1ea",
                      }}
                    >
                      📐{" "}
                      {
                        selectedRoom
                          .features
                          .size
                      }{" "}
                      sqm
                    </strong>
                  </div>
                )}

                {selectedRoom.floor && (
                  <div
                    style={{
                      padding:
                        "14px",
                      background:
                        "#12151c",
                      border:
                        "1px solid #262b35",
                      borderRadius:
                        "9px",
                    }}
                  >
                    <div
                      style={{
                        fontSize:
                          "11px",
                        color:
                          "#a7a9b3",
                        fontWeight:
                          "700",
                        marginBottom:
                          "5px",
                      }}
                    >
                      FLOOR
                    </div>

                    <strong
                      style={{
                        color:
                          "#f4f1ea",
                      }}
                    >
                      🏢{" "}
                      {
                        selectedRoom.floor
                      }
                    </strong>
                  </div>
                )}

                {selectedRoom.features
                  ?.balcony && (
                  <div
                    style={{
                      padding:
                        "14px",
                      background:
                        "rgba(65,180,105,0.08)",
                      border:
                        "1px solid rgba(65,180,105,0.18)",
                      borderRadius:
                        "9px",
                    }}
                  >
                    <div
                      style={{
                        fontSize:
                          "11px",
                        color:
                          "#79d99a",
                        fontWeight:
                          "700",
                        marginBottom:
                          "5px",
                      }}
                    >
                      FEATURE
                    </div>

                    <strong
                      style={{
                        color:
                          "#79d99a",
                      }}
                    >
                      🌿 Balcony
                    </strong>
                  </div>
                )}
              </div>

              {/* AMENITIES */}
              {getAmenities(
                selectedRoom
              ).length > 0 && (
                <div
                  style={{
                    marginBottom:
                      "24px",
                  }}
                >
                  <h3
                    style={{
                      margin:
                        "0 0 12px",
                      fontFamily:
                        "Georgia, serif",
                      fontWeight:
                        "500",
                      fontSize:
                        "20px",
                      color:
                        "#f4f1ea",
                    }}
                  >
                    Room Amenities
                  </h3>

                  <div
                    style={{
                      display:
                        "flex",
                      flexWrap:
                        "wrap",
                      gap:
                        "8px",
                    }}
                  >
                    {getAmenities(
                      selectedRoom
                    ).map(
                      (
                        amenity,
                        index
                      ) => (
                        <span
                          key={`modal-amenity-${index}`}
                          style={{
                            padding:
                              "8px 12px",
                            background:
                              "rgba(232,163,62,0.09)",
                            border:
                              "1px solid rgba(232,163,62,0.20)",
                            color:
                              "#ffcf85",
                            borderRadius:
                              "20px",
                            fontSize:
                              "13px",
                            fontWeight:
                              "600",
                          }}
                        >
                          ✓{" "}
                          {amenity}
                        </span>
                      )
                    )}
                  </div>
                </div>
              )}

              {/* ACTIONS */}
              <div
                style={{
                  display:
                    "grid",
                  gridTemplateColumns:
                    "1fr 1fr",
                  gap:
                    "10px",
                }}
              >
                <button
                  type="button"
                  onClick={() =>
                    toggleFavorite(
                      selectedRoom._id
                    )
                  }
                  style={{
                    padding:
                      "13px",
                    border:
                      "1px solid #262b35",
                    background:
                      "#12151c",
                    color:
                      favorites.includes(
                        selectedRoom._id
                      )
                        ? "#e8a33e"
                        : "#a7a9b3",
                    borderRadius:
                      "7px",
                    cursor:
                      "pointer",
                    fontWeight:
                      "700",
                    transition:
                      "all 0.2s ease",
                  }}
                >
                  {favorites.includes(
                    selectedRoom._id
                  )
                    ? "♥ Remove favorite"
                    : "♡ Add to favorites"}
                </button>

                <button
                  type="button"
                  disabled={
                    selectedRoom.status !==
                    "available"
                  }
                  onClick={() => {
                    setSelectedRoom(null);

                    handleBookNow(
                      selectedRoom._id,
                      selectedRoom.status
                    );
                  }}
                  style={{
                    padding:
                      "13px",
                    border:
                      "none",
                    background:
                      selectedRoom.status ===
                      "available"
                        ? "linear-gradient(135deg, #ffcf85, #e8a33e)"
                        : "#262b35",
                    color:
                      selectedRoom.status ===
                      "available"
                        ? "#2b2417"
                        : "#727783",
                    borderRadius:
                      "7px",
                    cursor:
                      selectedRoom.status ===
                      "available"
                        ? "pointer"
                        : "not-allowed",
                    fontWeight:
                      "700",
                    transition:
                      "all 0.2s ease",
                  }}
                >
                  {selectedRoom.status ===
                  "available"
                    ? "Book this room"
                    : "Room unavailable"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Rooms;
