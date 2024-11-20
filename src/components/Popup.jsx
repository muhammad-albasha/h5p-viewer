import React, { useRef } from "react";

const Popup = ({ content, onClose, infoText }) => {
  const fullscreenContainer = useRef(null);
  const h5pContainer = useRef(null);

  const handleFullscreenH5P = () => {
    if (h5pContainer.current.requestFullscreen) {
      h5pContainer.current.requestFullscreen();
    } else if (h5pContainer.current.mozRequestFullScreen) {
      // Für Firefox
      h5pContainer.current.mozRequestFullScreen();
    } else if (h5pContainer.current.webkitRequestFullscreen) {
      // Für Safari
      h5pContainer.current.webkitRequestFullscreen();
    } else if (h5pContainer.current.msRequestFullscreen) {
      // Für IE/Edge
      h5pContainer.current.msRequestFullscreen();
    }
  };

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
          <div className="popup-h5p-content" ref={h5pContainer}>
            {content}
          </div>
          <div className="popup-info">
            <h3>Information</h3>
            <p>{infoText}</p>
            <button
              className="fullscreen-btn"
              onClick={handleFullscreenH5P}
              title="H5P im Vollbildmodus anzeigen"
            >
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
                className="feather feather-maximize"
              >
                <path d="M8 3H5a2 2 0 0 0-2 2v3"></path>
                <path d="M16 3h3a2 2 0 0 1 2 2v3"></path>
                <path d="M8 21H5a2 2 0 0 1-2-2v-3"></path>
                <path d="M16 21h3a2 2 0 0 0 2-2v-3"></path>
              </svg>
              Vollbildmodus
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Popup;
