import React, { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

interface FileSelectorScreenProps {
  files: string[];
  selectedFileIndex: number;
  onSelectFile: () => void;
  onFileChange: (idx: number) => void;
  setGlitchActive: (active: boolean) => void;
}

const FileSelectorScreen: React.FC<FileSelectorScreenProps> = ({
  files,
  selectedFileIndex,
  onSelectFile,
  onFileChange,
  setGlitchActive,
}) => {
  const lastScrollTime = useRef<number>(0);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);

  // Initialize refs array
  cardsRef.current = files.map((_, i) => cardsRef.current[i] ?? null);

  useGSAP(() => {
    files.forEach((_, i) => {
      const card = cardsRef.current[i];
      if (!card) return;

      const dist = i - selectedFileIndex;
      
      // Calculate properties based on distance from selected index
      let targetProps: gsap.TweenVars = {};

      if (dist === 0) {
        // Active card
        targetProps = {
          z: 0,
          y: 0,
          rotationX: 0,
          opacity: 1,
          zIndex: 100,
          scale: 1,
          filter: "brightness(1)",
        };
      } else if (dist > 0) {
        // Future cards (behind active)
        targetProps = {
          z: -60 * dist,
          y: -15 * dist, // Slight accumulation upward or downward? Let's go upward (-y) to simulate stack
          rotationX: 0,
          zIndex: 100 - dist,
          scale: Math.max(0.8, 1 - dist * 0.05),
          filter: "brightness(0.7)",
        };
      } else {
        // Passed cards (rotated and dropped below)
        const absDist = Math.abs(dist);
        targetProps = {
          z: -60 * absDist, // Move back in Z
          y: 180 + (absDist * 15), // Drop down significantly
          rotationX: -180 , // Flip
          zIndex: 90 - absDist, // Below active
          scale: Math.max(0.8, 1 - absDist * 0.05),
          filter: "brightness(0.5)",
        };
      }

      gsap.to(card, {
        ...targetProps,
        duration: 0.6,
        ease: "power2.out",
        transformOrigin: "50% 20%",
      });
    });
  }, [selectedFileIndex, files]);

  return (
    <div
      className="file-selector-container"
      onWheel={(e) => {
        const now = Date.now();
        if (now - lastScrollTime.current > 150) { // Reduced throttle for smoother feel
          const direction = e.deltaY > 0 ? 1 : -1;
          const nextIndex = selectedFileIndex + direction;

          if (nextIndex >= 0 && nextIndex < files.length) {
            setGlitchActive(true);
            setTimeout(() => setGlitchActive(false), 50);
            onFileChange(nextIndex);
            lastScrollTime.current = now;
          }
        }
      }}
    >
      <div className="file-bunch">
        {/* Wrapper for animated cards */}
        <div 
          className="file-cards-wrapper" 
          onClick={onSelectFile}
          style={{ 
            position: 'relative', 
            width: '300px', 
            height: '220px', 
            perspective: '1200px' 
          }}
        >
          {files.map((file, i) => (
            <div
              key={i}
              className="file-card amber-text"
              ref={(el) => (cardsRef.current[i] = el)}
              style={{
                position: 'absolute',
                top: 0,
                left: 0, // Hide back of card when rotated? Or maybe we want to see it? 
                // CRT transparency might make backface interesting, but let's keep it simple first.
                // Actually if rotation is -180, we see the back. The original code had rotationX -180 so we probably want to support that.
                // Original transformOrigin was "150px 165px", preserving that logic in GSAP or CSS?
                // The GSAP code above overrides transformOrigin to center.
                // Let's stick to the center for now as it's cleaner for stacks.
              }}
            >
              <div
                className="file-card-tab"
                style={{
                  // Tab position should probably be static or it shifts weirdly in a stack
                  // Original: left: `${20 + selectedFileIndex * 50}px` -> this was moving the tab based on selection
                  // If we want them stacked, maybe tabs should stagger?
                  // For now, let's keep tabs fixed or stagger them based on their OWN index
                  left: `${20 + (i % 5) * 40}px`, 
                }}
              >
                {file[0]}
              </div>
              <div className="file-card-head"></div>
              <div className="file-card-body">
                <div className="file-name">{file}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="hook left"></div>
      <div className="hook right"></div>

      <div className="side-indicator left">
        {[...Array(10)].map((_, i) => (
          <div key={i} className="indicator-bar"></div>
        ))}
      </div>

      <div className="side-indicator right">
        {[...Array(10)].map((_, i) => (
          <div key={i} className="indicator-bar"></div>
        ))}
      </div>
    </div>
  );
};

export default FileSelectorScreen;
