import React, { useState, useEffect, useCallback, useRef } from "react";
import "./CRTTerminal.css";
import BootScreen from "./BootScreen";
import FileSelectorScreen from "./FileSelectorScreen";
import MdrScreen from "./MdrScreen";
import InstructionsScreen from "./InstructionsScreen";
import CongratulationsScreen from "./CongratulationsScreen";
import FinaleScreen from "./FinaleScreen";

interface CRTTerminalProps {
  scale?: number;
}

const CRTTerminal: React.FC<CRTTerminalProps> = ({ scale = 1 }) => {
  const [currentScreen, setCurrentScreen] = useState<"boot" | "instructions" | "files" | "empty" | "congratulations" | "finale">(
    "boot",
  );
  const [glitchActive, setGlitchActive] = useState<boolean>(false);
  const [selectedFileIndex, setSelectedFileIndex] = useState<number>(0);
  const [language, setLanguage] = useState<"en" | "es">("en");
  const files = ["Wellington", "Dranesville", "Cold Harbor"];
  const [fileBinProgresses, setFileBinProgresses] = useState<Record<string, number[]>>({});
  const containerRef = useRef<HTMLDivElement>(null);

  // Trigger a glitch effect
  const triggerGlitch = useCallback((duration: number = 50) => {
    setGlitchActive(true);
    setTimeout(() => setGlitchActive(false), duration);
  }, []);

  // Random glitch effect - more frequent
  useEffect(() => {
    const glitchInterval = setInterval(() => {
      if (Math.random() > 0.6) {
        triggerGlitch(30 + Math.random() * 80);
      }
    }, 800);
    return () => clearInterval(glitchInterval);
  }, [triggerGlitch]);


  // DEV TOOLS: Quick Navigation
  useEffect(() => {
    const handleDevKeys = (e: KeyboardEvent) => {
        if (e.altKey) {
            switch(e.code) {
                case 'Digit1': setCurrentScreen('boot'); break;
                case 'Digit2': setCurrentScreen('instructions'); break;
                case 'Digit3': setCurrentScreen('files'); break;
                case 'Digit4': setCurrentScreen('congratulations'); break;
                case 'Digit5': setCurrentScreen('finale'); break;
            }
        }
    };
    window.addEventListener('keydown', handleDevKeys);
    return () => window.removeEventListener('keydown', handleDevKeys);
  }, []);

  // Transition from Congratulations to Finale
  useEffect(() => {
    if (currentScreen === "congratulations") {
        const timer = setTimeout(() => {
            setCurrentScreen("finale");
        }, 5000);
        return () => clearTimeout(timer);
    }
  }, [currentScreen]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (currentScreen === "files") {
      if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        setSelectedFileIndex((prev) =>
          prev > 0 ? prev - 1 : files.length - 1,
        );
      } else if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        setSelectedFileIndex((prev) =>
          prev < files.length - 1 ? prev + 1 : 0,
        );
      } else if (e.key === "Enter") {
        setCurrentScreen("empty");
      }
    }
    // MDR Key events handled by MdrScreen's global listener when active
  };

  const currentFile = files[selectedFileIndex];
  const currentBinProgress = fileBinProgresses[currentFile] || [0, 0, 0];

  const handleBinUpdate = (binIndex: number, value: number) => {
       setFileBinProgresses(prev => {
           const newBins = [...(prev[currentFile] || [0, 0, 0])];
           newBins[binIndex] = value;
           const newProgresses = { ...prev, [currentFile]: newBins };
           
           // Check for completion of ALL files
           // We need to check if every file in the 'files' list has an entry in newProgresses
           // AND that entry has all bins at 100
           const allComplete = files.every(f => {
               const bins = newProgresses[f];
               return bins && bins.every(b => b === 100);
           });

           if (allComplete) {
               setTimeout(() => setCurrentScreen("congratulations"), 1000);
           }

           return newProgresses;
       });
  };

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
                    <BootScreen onComplete={() => setCurrentScreen("instructions")} />
                  )}

                  {currentScreen === "instructions" && (
                    <InstructionsScreen 
                        onComplete={() => setCurrentScreen("files")} 
                        setLanguage={setLanguage}
                    />
                  )}

                  {currentScreen === "files" && (
                    <FileSelectorScreen 
                        files={files}
                        selectedFileIndex={selectedFileIndex}
                        onSelectFile={() => setCurrentScreen("empty")}
                        onFileChange={setSelectedFileIndex}
                        setGlitchActive={setGlitchActive}
                    />
                  )}

                  {currentScreen === "empty" && (
                    <MdrScreen 
                        fileName={files[selectedFileIndex]}
                        binProgress={currentBinProgress}
                        onBinUpdate={handleBinUpdate}
                        onBack={() => setCurrentScreen('files')}
                    />
                  )}

                  {currentScreen === "congratulations" && (
                    <CongratulationsScreen language={language} />
                  )}

                  {currentScreen === "finale" && (
                    <FinaleScreen />
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
