import React from "react";

export const Service = ({ service, onActionclick, actionText }) => {
  return (
    <div key={service.name} className="service-container">
      <span>
        <strong>{service.name}</strong>
      </span>
      <div>
        <span className="margin-right-20">
          {service.needOnlinePayment && "Payable en ligne 💳"}
        </span>
        <button onClick={() => onActionclick(service)} className="btn">
          {actionText}
        </button>
      </div>
    </div>
  );
};
