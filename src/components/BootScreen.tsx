import React, { useEffect, useState } from "react";

interface BootScreenProps {
  onComplete: () => void;
}

const BootScreen: React.FC<BootScreenProps> = ({ onComplete }) => {
  const [bootSequence, setBootSequence] = useState<number>(0);

  useEffect(() => {
    if (bootSequence < 5) {
      const timeout = setTimeout(
        () => setBootSequence((prev) => prev + 1),
        400,
      );
      return () => clearTimeout(timeout);
    } else {
      const timeout = setTimeout(onComplete, 500);
      return () => clearTimeout(timeout);
    }
  }, [bootSequence, onComplete]);

  return (
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
  );
};

export default BootScreen;
