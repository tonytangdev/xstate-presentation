import React, { StrictMode } from "react";
import ReactDOM from "react-dom";
import { inspect } from "@xstate/inspect";
import App from "./App";

inspect({
  iframe: false
});

const rootElement = document.getElementById("root");
ReactDOM.render(
  <StrictMode>
    <App />
  </StrictMode>,
  rootElement
);
