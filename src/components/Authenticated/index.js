import React from "react";

import "./style.css";

export const Authenticated = ({ userName }) => {
  return (
    <div className="authenticated-container">
      <h3>
        <span role="img" aria-label="handshake">
          🤝
        </span>
        Enchanté {userName} !
      </h3>
    </div>
  );
};
