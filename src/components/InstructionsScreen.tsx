import React, { useState, useEffect } from 'react';
import './CRTTerminal.css';

interface InstructionsScreenProps {
  onComplete: () => void;
  setLanguage: (lang: 'en' | 'es') => void;
}

const InstructionsScreen: React.FC<InstructionsScreenProps> = ({ onComplete, setLanguage }) => {
  const [step, setStep] = useState<'lang-select' | 'instructions'>('lang-select');
  const [displayedText, setDisplayedText] = useState('');
  const [fullText, setFullText] = useState('');
  const [localLang, setLocalLang] = useState<'en' | 'es'>('en');
  
  // Audio ref for tying sound (optional, but good for "terminalish" feel if we had one)
  // For now just visual.

  const textEn = `
> IMPORTANT PROTOCOL <

1. Hover over the numbers to classify them by emotions.
2. Press [1] for Happiness.
3. Press [2] for Love.
4. Press [3] for Sadness.

Press [ENTER] to begin extraction.
`;

  const textEs = `
> PROTOCOLO IMPORTANTE <

1. Pasa el cursor sobre los números para clasificarlos por emociones.
2. Presiona [1] para Felicidad.
3. Presiona [2] for Amor.
4. Presiona [3] for Tristeza.

Presiona [ENTER] para comenzar la extracción.
`;

  const langPrompt = `
SELECT LANGUAGE / SELECCIONE IDIOMA

[1] ENGLISH
[2] ESPAÑOL
`;

  useEffect(() => {
    if (step === 'lang-select') {
      setFullText(langPrompt);
      setDisplayedText('');
    } else {
      setFullText(localLang === 'en' ? textEn : textEs);
      setDisplayedText('');
    }
  }, [step, localLang]);

  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      if (index < fullText.length) {
        setDisplayedText((prev) => prev + fullText.charAt(index));
        index++;
      } else {
        clearInterval(interval);
      }
    }, 15); // Typing speed
    return () => clearInterval(interval);
  }, [fullText]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (step === 'lang-select') {
        if (e.key === '1') {
          setLocalLang('en');
          setLanguage('en');
          setStep('instructions');
        } else if (e.key === '2') {
          setLocalLang('es');
          setLanguage('es');
          setStep('instructions');
        }
      } else {
        if (e.key === 'Enter') {
          onComplete();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [step, onComplete, setLanguage]);

  return (
    <div className="instructions-container terminal-mode">
      <div className="instructions-content terminal-text">
        <pre style={{ whiteSpace: 'pre-wrap', textAlign: 'left', fontFamily: 'inherit' }}>
          {displayedText}
          <span className="cursor-block">█</span>
        </pre>
      </div>
    </div>
  );
};

export default InstructionsScreen;
