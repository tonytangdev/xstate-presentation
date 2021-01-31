import { useMachine } from "@xstate/react";
import React, { useEffect } from "react";
import { Authenticated } from "./components/Authenticated";
import { Authentication } from "./components/Authentication";
import { Calendar } from "./components/Calendar";
import { OnlinePayment } from "./components/OnlinePayment";
import { ServicesList } from "./components/ServicesList/index";
import { computeStateProgression } from "./helpers/computeStateProgression";
import { bookingMachine, BOOKING_STATES } from "./machines/bookingMachine";
import "./styles.css";

export default function App() {
  const [state, send] = useMachine(bookingMachine, {
    devTools: true
  });

  const {
    services,
    selectedDate,
    userName,
    needOnlinePayment,
    error,
    creditCard
  } = state.context;

  // allows to know which steps must be displayed
  const stateProgression = computeStateProgression(state, BOOKING_STATES);

  // calls the event SERVICE.ADD with the service from the parameter
  const onServiceAdd = (service) => {
    const { name, needOnlinePayment } = service;
    send({
      type: "SERVICE.ADD",
      service: {
        name,
        needOnlinePayment
      }
    });
  };

  // calls the event DATE.SELECT with the service from the parameter
  const onSelectDate = (date) => {
    send({
      type: "DATE.SELECTED",
      selectedDate: date
    });
  };

  const onSuccessButtonClick = () => {
    send({
      type: "SUBMIT",
      isSuccessful: true
    });
  };

  const onFailButtonClick = () => {
    send({
      type: "SUBMIT",
      isSuccessful: false
    });
  };

  const onCreditCardClick = (creditCard) => {
    send({
      type: "CREDIT_CARD.SELECT",
      creditCard
    });
  };

  useEffect(() => {
    // The machine is in its final state
    // meaning the appointment has been saved
    if (state.matches(BOOKING_STATES.CONFIRMED)) {
      alert("Ton RDV a été enregistré ✅");
    }
  }, [state]);

  useEffect(() => {
    // There's an error, let's alert the user
    if (!!error) {
      alert(`Oh oh, un missile vient d'être envoyé vers Lune 🚀💥🌑`);

      // Clean the error, let's be serious 🤓
      setInterval(() => {
        send("ERROR.CLEAN");
      }, 2000);
    }
  }, [error, send]);

  return (
    <div className="App">
      <section>
        <h2>1. Prestations</h2>
        <ServicesList selectedServices={services} onServiceAdd={onServiceAdd} />
      </section>
      {stateProgression.includes(BOOKING_STATES.IDLE) && (
        <section>
          <h2>2. Date du rdv</h2>
          <Calendar onSelectDate={onSelectDate} selectedDate={selectedDate} />
        </section>
      )}
      {stateProgression.includes(BOOKING_STATES.SELECTING_DATE) && (
        <section>
          <h2>3. Connexion</h2>
          {!userName ? (
            <Authentication parentMachineState={state} />
          ) : (
            <Authenticated userName={userName} />
          )}
        </section>
      )}
      {needOnlinePayment &&
        stateProgression.includes(BOOKING_STATES.AUTHENTICATION) && (
          <section>
            <h2>4. Paiement</h2>
            <OnlinePayment
              selectedCreditCard={creditCard}
              onCreditCardClick={onCreditCardClick}
            />
          </section>
        )}
      {((!needOnlinePayment &&
        stateProgression.includes(BOOKING_STATES.AUTHENTICATION)) ||
        stateProgression.includes(BOOKING_STATES.CREDIT_CARD)) && (
        <div>
          <button
            className="btn btn-primary btn-big"
            onClick={onSuccessButtonClick}
          >
            Réserver (celui qui marche)
          </button>
          <button
            className="btn btn-primary btn-big"
            onClick={onFailButtonClick}
          >
            Réserver (celui qui marche pas)
          </button>
        </div>
      )}
    </div>
  );
}
