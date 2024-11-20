import React, { useRef } from "react";

const Popup = ({ content, onClose, infoText }) => {
  const fullscreenContainer = useRef(null);

  return (
    <div className="popup-overlay" onClick={onClose}>
      <div
        className="popup-content"
        ref={fullscreenContainer}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button className="close-btn" onClick={onClose} title="Schließen">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="feather feather-x"
          >
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        {/* Layout: H5P Content + Info Text */}
        <div className="popup-layout">
          <div className="popup-h5p-content">{content}</div>
          <div className="popup-info">
            <h3>Information</h3>
            <p>{infoText}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Popup;
