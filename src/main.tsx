import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Prevent copy and context menu (except on admin pages)
const isAdmin = () => window.location.pathname.startsWith("/alchem-admin");
document.addEventListener("copy", (e) => { if (!isAdmin()) e.preventDefault(); });
document.addEventListener("cut", (e) => { if (!isAdmin()) e.preventDefault(); });
document.addEventListener("contextmenu", (e) => { if (!isAdmin()) e.preventDefault(); });

createRoot(document.getElementById("root")!).render(<App />);
