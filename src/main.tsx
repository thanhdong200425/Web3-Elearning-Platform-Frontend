import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Buffer } from "buffer";

// Polyfill for global and Buffer (needed for Pinata SDK and other Node.js dependencies)
if (typeof global === "undefined") {
  (window as any).global = window;
}
if (typeof window !== "undefined") {
  (window as any).Buffer = Buffer;
}

import App from "./App.tsx";
import { Provider } from "./provider.tsx";
import "@/styles/globals.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Provider>
        <App />
      </Provider>
    </BrowserRouter>
  </React.StrictMode>,
);
