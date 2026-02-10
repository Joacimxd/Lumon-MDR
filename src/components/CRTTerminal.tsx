import React, { useState, useEffect, useCallback, useRef } from "react";
import "./CRTTerminal.css";



interface CRTTerminalProps {
  scale?: number;
}

const CRTTerminal: React.FC<CRTTerminalProps> = ({ scale = 1 }) => {
  const [bootSequence, setBootSequence] = useState<number>(0);

  const [currentScreen, setCurrentScreen] = useState<"boot" | "files" | "empty">(
    "boot",
  );
  const [glitchActive, setGlitchActive] = useState<boolean>(false);

  const [selectedFileIndex, setSelectedFileIndex] = useState<number>(0);
  const files = ["Le Mars", "Coleman", "Dyer", "Eagan", "Lumon"];

  const lastScrollTime = useRef<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // MDR State
  const [mdrGrid, setMdrGrid] = useState<{ val: number; id: string; offset: number }[][]>([]);
  const [mousePos, setMousePos] = useState({ x: -100, y: -100 });
  
  useEffect(() => {
    // Generate random grid 12x18
    const rows = 12;
    const cols = 18;
    const newGrid = Array.from({ length: rows }, (_, r) =>
        Array.from({ length: cols }, (_, c) => ({
            val: Math.floor(Math.random() * 10),
            id: `${r}-${c}`,
            offset: Math.random() * 2000 // Random animation delay
        }))
    );
    setMdrGrid(newGrid);
  }, []);

  const handleMdrMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    // Get relative coordinates within the grid container
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setMousePos({ x, y });
  };



  // Trigger a glitch effect
  const triggerGlitch = useCallback((duration: number = 50) => {
    setGlitchActive(true);
    setTimeout(() => setGlitchActive(false), duration);
  }, []);

  // Cursor blink effect


  // Boot sequence animation
  useEffect(() => {
    if (bootSequence < 5) {
      const timeout = setTimeout(
        () => setBootSequence((prev) => prev + 1),
        400,
      );
      return () => clearTimeout(timeout);
    }
  }, [bootSequence]);

  // Random glitch effect - more frequent
  useEffect(() => {
    const glitchInterval = setInterval(() => {
      if (Math.random() > 0.6) {
        triggerGlitch(30 + Math.random() * 80);
      }
    }, 800);
    return () => clearInterval(glitchInterval);
  }, [triggerGlitch]);



  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (currentScreen === "files") {
      if (e.key === "ArrowLeft") {
        setSelectedFileIndex((prev) =>
          prev > 0 ? prev - 1 : files.length - 1,
        );
      } else if (e.key === "ArrowRight") {
        setSelectedFileIndex((prev) =>
          prev < files.length - 1 ? prev + 1 : 0,
        );
      } else if (e.key === "Enter") {
        setCurrentScreen("empty");
      }
    }
  };

  useEffect(() => {
    if (bootSequence >= 5) {
      const timeout = setTimeout(() => setCurrentScreen("files"), 3000);
      return () => clearTimeout(timeout);
    }
  }, [bootSequence]);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.focus();
    }
  }, [currentScreen]);

  return (
    <div
      ref={containerRef}
      className="crt-container"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      style={{
        transform: `scale(${scale})`,
        transformOrigin: "center center",
      }}
    >
      <div className="crt-monitor">
        <div className="vent-slots">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="vent-slot" />
          ))}
        </div>
        <div className="crt-bezel">
          <div className={`crt-screen ${glitchActive ? "glitch-active" : ""}`}>
            <div className="reflection" />
            <div className="crt-glass" />
            <div className="crt-bulge" />
            <div className="edge-shadow" />
            <div className="curved-distortion" />
            <div className="screen-warp">
              <div className="screen-inner">
                <div className="screen-content flicker">
                  {currentScreen === "boot" && (
                    <div className="boot-container amber-text">
                      {bootSequence >= 1 && (
                        <div
                          className="boot-line"
                          style={{ animationDelay: "0ms", fontSize: "24px" }}
                        >
                          Loading<span className="loading-dots"></span>
                        </div>
                      )}
                      {bootSequence >= 2 && (
                        <div
                          className="boot-line dim-text"
                          style={{ animationDelay: "100ms", marginTop: "10px" }}
                        >
                          (C) 1856 LUMON INDUSTRIES CORP.
                        </div>
                      )}
                    </div>
                  )}



                  {currentScreen === "files" && (
                    <div
                      className="file-selector-container"
                      onWheel={(e) => {
                        const now = Date.now();
                        if (now - lastScrollTime.current > 500) {
                          // Throttle 500ms
                          setGlitchActive(true); // Small glitch on switch
                          setTimeout(() => setGlitchActive(false), 50);

                          if (e.deltaY > 0) {
                            setSelectedFileIndex((prev) =>
                              prev < files.length - 1 ? prev + 1 : 0,
                            );
                          } else {
                            setSelectedFileIndex((prev) =>
                              prev > 0 ? prev - 1 : files.length - 1,
                            );
                          }
                          lastScrollTime.current = now;
                        }
                      }}
                    >
                      <div className="side-indicator">
                        {[...Array(15)].map((_, i) => (
                          <div key={i} className="indicator-bar"></div>
                        ))}
                      </div>

                      <div className="file-bunch">
                        {/* Wrapper for animated cards only */}
                        <div
                          className={`file-cards-wrapper ${true ? "" : ""}`}
                          key={selectedFileIndex}
                          onClick={() => setCurrentScreen("empty")}
                        >
                          <div className="file-card amber-text">
                            <div
                              className="file-card-tab"
                              style={{
                                left: `${20 + selectedFileIndex * 50}px`,
                              }}
                            >
                              {files[selectedFileIndex][0]}
                            </div>
                            <div className="file-card-footer"></div>
                            <div className="file-card-body">
                              <div className="file-name">
                                {files[selectedFileIndex]}
                              </div>
                            </div>
                          </div>

                          <div
                            className="file-card amber-text"
                            style={{
                              visibility:
                                selectedFileIndex > 0 ? "visible" : "hidden",
                            }}
                          >
                            <div
                              className="fle-card-tab-b"
                              style={{
                                left: `${20 + (selectedFileIndex - 1) * 50}px`,
                              }}
                            ></div>
                          </div>
                        </div>

                        <div className="hook left"></div>
                        <div className="hook right"></div>
                      </div>

                      <div className="side-indicator">
                        {[...Array(15)].map((_, i) => (
                          <div key={i} className="indicator-bar"></div>
                        ))}
                      </div>
                    </div>
                  )}


                  {currentScreen === "empty" && (
                    <div className="mdr-container amber-text retro-cursor-area">
                      <div className="mdr-header">
                        <div className="mdr-file-name">
                            {files[selectedFileIndex]}
                        </div>
                        <div className="mdr-progress">
                            0% Complete
                        </div>
                         <div className="mdr-logo">
                            LUMON
                        </div>
                      </div>

                      <div 
                        className="mdr-grid"
                        onMouseMove={handleMdrMouseMove}
                        onMouseLeave={() => setMousePos({ x: -1000, y: -1000 })}
                      >
                        {mdrGrid.map((row, rIndex) => (
                            <div key={rIndex} className="mdr-row">
                                {row.map((cell, cIndex) => {
                                    // Calculate distance-based scale
                                    // Let's assume approx cell center based on index
                                    // Row height ~30px, Col width ~35px (including gaps)
                                    // This is an estimation, but good enough for visual effect
                                    const cellCenterX = cIndex * 35 + 17;
                                    const cellCenterY = rIndex * 30 + 15;
                                    
                                    const dist = Math.sqrt(
                                        Math.pow(mousePos.x - cellCenterX, 2) + 
                                        Math.pow(mousePos.y - cellCenterY, 2)
                                    );
                                    
                                    // Radius of effect ~100px
                                    let scale = 1;
                                    if (dist < 100) {
                                       // Linear interpolation: dist 0 -> scale 2, dist 100 -> scale 1
                                       scale = 1 + (1 - dist / 100) * 0.8; 
                                    }

                                    return (
                                        <span 
                                            key={cell.id} 
                                            className="mdr-cell retro-cursor"
                                            style={{
                                                animationDelay: `${cell.offset}ms`,
                                                transform: `scale(${scale}) translateY(0px)` // translateY handled by keyframes, but scale here overrides if we aren't careful. Use nested div or wrapper?
                                                // Actually, CSS animation uses transform. Overwriting transform here will kill the wobble.
                                                // Better: Apply scale to a wrapper or inner span.
                                            }}
                                        >
                                           <span style={{ 
                                               display: 'inline-block', 
                                               transform: `scale(${scale})`,
                                               transition: 'transform 0.1s ease-out'
                                           }}>
                                             {cell.val}
                                           </span>
                                        </span>
                                    );
                                })}
                            </div>
                        ))}
                      </div>

                      <div className="mdr-bins">
                        {["00", "01", "02", "03", "04"].map((bin) => (
                            <div key={bin} className="mdr-bin">
                                <div className="bin-label">{bin}</div>
                                <div className="bin-bar-container">
                                    <div className="bin-bar" style={{width: "0%"}}></div>
                                    <div className="bin-percent">0%</div>
                                </div>
                            </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="power-led" />
        </div>
      </div>
    </div>
  );
};

export default CRTTerminal;
