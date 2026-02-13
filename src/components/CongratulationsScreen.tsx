import React from 'react';
import './CRTTerminal.css';
import Logo from './Logo';

interface CongratulationsScreenProps {
  language: 'en' | 'es';
}

const CongratulationsScreen: React.FC<CongratulationsScreenProps> = ({ language }) => {
  const content = {
    en: {
      title: "100% COMPLETE",
      msg1: "EVEN SEVERED I WOULD NEVER FORGET YOU",
      praise: "MICHELLE."
    },
    es: {
      title: "100% COMPLETADO",
      msg1: "YO NI CERCENADO TE OLVIDARÍA",
      praise: "MICHELLE."
    }
  };

  const text = content[language];

  return (
    <div className="congratulations-container">
      <div className="congratulations-content">
        <Logo />
        <br />
        <br />
        <h1 className="blink-text">{text.title}</h1>
        <br />
        <p>{text.msg1}</p>
        <br />
        <br />
        <p>{text.praise}</p>
      </div>
    </div>
  );
};

export default CongratulationsScreen;
