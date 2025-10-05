// main.jsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Home from "./Home.jsx";
import Agent from "./Agent.jsx";
import Graphs from "./Graphs.jsx";
import About from "./About.jsx";
import "./index.css";

/* --- Theme boot (منع الوميض + احترام النظام) --- */
function getInitialTheme() {
  try {
    const stored = localStorage.getItem("theme");
    if (stored === "light" || stored === "dark") return stored;
  } catch (err) {
    console.error("Failed to save theme:", err);
  }
  return window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}
function applyTheme(t) {
  const html = document.documentElement;
  html.setAttribute("data-theme", t);
  html.style.colorScheme = t; // يساعد بعناصر النظام
  try {
    localStorage.setItem("theme", t);
  } catch (err) {
    console.error("Failed to save theme:", err);
  }
}
// طبّق مباشرة قبل أي رندر
applyTheme(getInitialTheme());

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/assistant" element={<Agent />} />
        <Route path="/graphs" element={<Graphs />} />
        <Route path="/about" element={<About />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
