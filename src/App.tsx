import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom'
import CRTTerminal from './components/CRTTerminal'
import LCDGadget from './components/LCDGadget'
import './App.css'

interface GadgetInfo {
  id: string;
  name: string;
  path: string;
  description: string;
}

const gadgets: GadgetInfo[] = [
  {
    id: 'crt',
    name: 'NEXUS-7 TERMINAL',
    path: '/',
    description: 'Amber phosphor CRT display terminal'
  },
  {
    id: 'lcd',
    name: 'OPTICAL UNIT',
    path: '/lcd',
    description: 'LCD surveillance device with camera'
  }
];

function GadgetGallery() {
  const [scale, setScale] = useState<number>(0.6)
  const location = useLocation()

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
    window.addEventListener('resize', calculateScale);
    return () => window.removeEventListener('resize', calculateScale);
  }, []);

  const scaleOptions = [
    { value: 0.4, label: '40%' },
    { value: 0.5, label: '50%' },
    { value: 0.6, label: '60%' },
    { value: 0.75, label: '75%' },
    { value: 1, label: '100%' },
  ]

  const currentGadget = gadgets.find(g => g.path === location.pathname) || gadgets[0];

  return (
    <div style={{
      display: 'flex',
      height: '100vh',
      background: '#1a1a1a',
      overflow: 'hidden'
    }}>
      {/* Gadget Display */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        padding: '10px',
      }}>
        <Routes>
          <Route path="/" element={<CRTTerminal scale={scale} />} />
          <Route path="/lcd" element={<LCDGadget scale={scale} />} />
        </Routes>
      </div>
    </div>
  )
}

function App() {
  return (
    <Router>
      <GadgetGallery />
    </Router>
  )
}

export default App