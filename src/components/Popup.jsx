import React, { useRef, useState, useEffect } from "react";

const Popup = ({ content, onClose, infoText }) => {
  const h5pContainer = useRef(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      if (h5pContainer.current.requestFullscreen) {
        h5pContainer.current.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  return (
    <div className="popup-overlay" onClick={onClose}>
      <div className="popup-content" onClick={(e) => e.stopPropagation()}>
        {/* Header: Vollbild-Button und Schließbutton (Position getauscht) */}
        <div className="popup-header">
          <button
            className={`fullscreen-toggle ${isFullscreen ? "active" : ""}`}
            onClick={toggleFullscreen}
            aria-label={
              isFullscreen ? "Vollbild beenden" : "Vollbild aktivieren"
            }
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              {isFullscreen ? (
                <path d="M4 8V4m0 0h4M4 4l5 5m11-5h-4m4 0v4m0-5l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              ) : (
                <path d="M4 8V4m0 0h4M4 4l5 5m11-5h-4m4 0v4m0-5l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              )}
            </svg>
          </button>
          <button
            className="close-btn"
            onClick={onClose}
            aria-label="Schließen"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="popup-layout">
          <div className="h5p-wrapper" ref={h5pContainer}>
            {content}
          </div>
          <div className="info-panel">
            <h3>Infos</h3>
            <div className="info-content">
              <p>{infoText}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Popup;
