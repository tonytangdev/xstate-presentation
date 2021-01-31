import React from "react";
import { isSameDay } from "../../helpers/dates";
import { computeAppointmentDates } from "../../mocks/appointmentDates";

import "./style.css";

export const Calendar = ({ selectedDate, onSelectDate }) => {
  const availableDates = computeAppointmentDates();

  const onClick = (date) => onSelectDate(date);
  return (
    <div className="calendar-container">
      <h2>
        <span role="img" aria-label="calendar">
          📆
        </span>{" "}
        Sélectionner une date
      </h2>
      <div className="dates-container">
        {availableDates.map((date) => {
          const text = `${date.getDate()}/${
            date.getMonth() + 1
          }/${date.getFullYear()}`;

          const isSelected = !!selectedDate && isSameDay(date, selectedDate);
          return (
            <button
              onClick={() => onClick(date)}
              key={text}
              className={`${isSelected ? "btn-active" : "btn"}`}
            >
              {text}
            </button>
          );
        })}
      </div>
    </div>
  );
};
