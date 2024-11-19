import React from "react";

const Popup = ({ content, onClose }) => {
  return (
    <div className="popup-overlay" onClick={onClose}>
      <div className="popup-content" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>
          X
        </button>
        {content}
      </div>
    </div>
  );
};

export default Popup;
