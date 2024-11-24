import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { SocketProvider } from "./context/SocketContext.jsx";
import { Buffer } from "buffer";

window.Buffer = Buffer;
window.process = process;

// Check if crypto exists
if (!window.crypto) {
  const crypto = require("crypto-browserify");
  window.crypto = crypto.webcrypto || crypto;
}

createRoot(document.getElementById("root")).render(
  <SocketProvider>
    <App />
  </SocketProvider>
);
