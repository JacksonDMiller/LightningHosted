import ReactDOM from "react-dom";
import App from "./Components/App";
import React from "react";
import { StateProvider } from "./Context/Store";
import { ViewportProvider } from "./Context/GetWindowDimensions";

ReactDOM.render(
  <StateProvider>
    <ViewportProvider>
      <App />
    </ViewportProvider>
  </StateProvider>,
  document.getElementById("root")
);
