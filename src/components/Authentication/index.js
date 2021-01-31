import { useActor } from "@xstate/react";
import React, { useState } from "react";

import "./style.css";

export const Authentication = ({ parentMachineState }) => {
  // The child machine is in the children object
  // the child machine key is its id
  const [state, send] = useActor(parentMachineState.children.auth);

  const { name, error } = state.context;

  const [userName, setUserName] = useState(name);

  const onInputChange = (e) => setUserName(e.target.value);

  const cancelAuth = () => send("AUTH.CANCEL");

  const logIn = () =>
    send({
      type: "AUTH.LOG_IN",
      name: userName
    });

  return (
    <div className="authentication-container">
      <h3>
        <span role="img" aria-label="question-mark">
          ❓
        </span>{" "}
        Comment t'appelles-tu ?
      </h3>
      <div className="input-container">
        <input
          className="input"
          value={userName}
          placeholder="Nom"
          onChange={onInputChange}
        />
        {error && (
          <span className="auth-error">
            Dis-moi stp...{" "}
            <span role="img" aria-label="cry">
              😭
            </span>
          </span>
        )}
      </div>
      <div className="actions-container">
        <div>
          <button className="btn" onClick={cancelAuth}>
            Annuler
          </button>
        </div>
        <div>
          <button className="btn btn-primary" onClick={logIn}>
            Se connecter
          </button>
        </div>
      </div>
    </div>
  );
};
