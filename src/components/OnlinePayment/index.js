import React from "react";
import { creditCards } from "../../mocks/creditCards";

import "./style.css";

export const OnlinePayment = ({ selectedCreditCard, onCreditCardClick }) => {
  const availableCreditCards = creditCards;

  const onClick = (creditCard) => onCreditCardClick(creditCard);
  return (
    <div className="online-payment-container">
      <h2>
        <span role="img" aria-label="calendar">
          💸
        </span>{" "}
        Choisis une CB, c'est moi qui régale{" "}
        <span role="img" aria-label="calendar">
          💸
        </span>
      </h2>
      <div className="credit-cards-container">
        {availableCreditCards.map((card) => {
          const isSelected = card === selectedCreditCard;
          return (
            <button
              onClick={() => onClick(card)}
              key={card}
              className={`${isSelected ? "btn-active" : "btn"}`}
            >
              {card}
            </button>
          );
        })}
      </div>
    </div>
  );
};
