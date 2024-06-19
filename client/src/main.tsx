import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { ContextProvider } from "./context/Context.tsx";
import { ChakraProvider } from "@chakra-ui/react";
import { Buffer } from "buffer";
import process from "process";

(window as any).global = window;
(window as any).process = process;
global.Buffer = Buffer;
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ContextProvider>
      <ChakraProvider>
        <App />
      </ChakraProvider>
    </ContextProvider>
  </React.StrictMode>
);
