import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Home from "./Home.jsx";
import Agent from "./Agent.jsx";
import Graphs from "./Graphs.jsx";
import About from "./About.jsx"; // ← add this
import "./index.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/assistant" element={<Agent />} />
        <Route path="/graphs" element={<Graphs />} />
        <Route path="/about" element={<About />} /> {/* ← new route */}
        {/* optional: catch-all to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
