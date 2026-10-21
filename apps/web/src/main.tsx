import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "@fontsource/chakra-petch/latin-500.css";
import "@fontsource/chakra-petch/latin-600.css";
import "@fontsource/chakra-petch/latin-700.css";
import "@fontsource-variable/jetbrains-mono/wght.css";
import "./styles/index.css";
import { App } from "./App";

const root = document.getElementById("root");

if (!root) {
  throw new Error("Elemento #root não encontrado.");
}

ReactDOM.createRoot(root).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>,
);
