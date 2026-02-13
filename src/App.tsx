import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import CRTTerminal from "./components/CRTTerminal";
import "./App.css";

function GadgetGallery() {
  const [scale, setScale] = useState<number>(0.6);

  // Auto-calculate scale based on viewport
  useEffect(() => {
    const calculateScale = () => {
      const vh = window.innerHeight;
      const vw = window.innerWidth - 240; // Subtract sidebar width

      // Base gadget dimensions (approximate max)
      const baseHeight = 700;
      const baseWidth = 800;

      const scaleH = (vh - 40) / baseHeight; // 40px for padding
      const scaleW = (vw - 40) / baseWidth;

      const newScale = Math.min(scaleH, scaleW, 1);
      setScale(Math.max(0.3, Math.min(newScale, 1)));
    };

    calculateScale();
    window.addEventListener("resize", calculateScale);
    return () => window.removeEventListener("resize", calculateScale);
  }, []);

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        background: "#1a1a1a",
        overflow: "hidden",
      }}
    >
      {/* Gadget Display */}
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
          padding: "10px",
        }}
      >
        <Routes>
          <Route path="/" element={<CRTTerminal scale={scale} />} />
        </Routes>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <GadgetGallery />
    </Router>
  );
}

export default App;
