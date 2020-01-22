import * as React from "react";
import * as ReactDOM from "react-dom";
import { StoreProvider } from "./Store";
import App from "./App";

const root = document.getElementById("root");
ReactDOM.render(
  <StoreProvider>
    <App />
  </StoreProvider>,
  root
);
