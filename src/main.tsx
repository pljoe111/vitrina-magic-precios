import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Prevent copy and context menu
document.addEventListener("copy", (e) => e.preventDefault());
document.addEventListener("cut", (e) => e.preventDefault());
document.addEventListener("contextmenu", (e) => e.preventDefault());

createRoot(document.getElementById("root")!).render(<App />);
