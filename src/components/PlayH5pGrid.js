import React, { useState } from "react";
import PlayH5p from "./PlayH5p";
import Popup from "./Popup";

const PlayH5pGrid = ({ h5pData }) => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [currentContent, setCurrentContent] = useState(null);

  const handleBoxClick = (content) => {
    setCurrentContent(content);
    setIsPopupOpen(true);
  };

  const closePopup = () => {
    setIsPopupOpen(false);
    setCurrentContent(null);
  };

  return (
    <>
      <div className="container">
        {h5pData.map((item) => (
          <div
            className="play-h5p-box"
            key={item.id}
            style={{
              backgroundImage: `url(${item.previewImage})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
            onClick={() =>
              handleBoxClick(<PlayH5p h5pJsonPath={item.h5pJsonPath} />)
            }
          >
            <h3>Klicken Sie, um anzuzeigen</h3>
          </div>
        ))}
      </div>

      {/* Popup */}
      {isPopupOpen && <Popup content={currentContent} onClose={closePopup} />}
    </>
  );
};

export default PlayH5pGrid;
