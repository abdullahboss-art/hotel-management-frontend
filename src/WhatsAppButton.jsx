// import React from "react";
// import "./WhatsAppButton.css";

// function WhatsAppButton() {
//   const phoneNumber = "923152635232";

//   const message = encodeURIComponent(
//     "Hello, I would like to know more about your hotel and room availability."
//   );

//   const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;

//   return (
//     <a
//       href={whatsappUrl}
//       target="_blank"
//       rel="noopener noreferrer"
//       className="whatsapp-floating-button"
//       aria-label="Chat with us on WhatsApp"
//       title="Chat with us on WhatsApp"
//     >
//       <img
//         src="/images/Whatsepp_Button.png"
//         alt="WhatsApp"
//         className="whatsapp-image"
//       />
//     </a>
//   );
// }

// export default WhatsAppButton;


import React, { useState } from "react";
import "./WhatsAppButton.css";

function WhatsAppButton() {
  const [loading, setLoading] = useState(true);

  const phoneNumber = "923152635232";

  const message = encodeURIComponent(
    "Hello, I would like to know more about your hotel and room availability."
  );

  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={`whatsapp-floating-button ${loading ? "loading" : "loaded"}`}
      aria-label="Chat with us on WhatsApp"
      title="Chat with us on WhatsApp"
    >
      {loading && <span className="whatsapp-loader"></span>}

      <img
        src="/images/Whatsepp_Button.png"
        alt="WhatsApp"
        className={`whatsapp-image ${loading ? "image-hidden" : ""}`}
        onLoad={() => setLoading(false)}
      />
    </a>
  );
}

export default WhatsAppButton;

