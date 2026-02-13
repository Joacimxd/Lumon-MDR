import React, { useState, useEffect, useRef } from 'react';
import './CRTTerminal.css';

const lyricsData = [
  { time: 1, text: "..." },
  {time: 10, text: "cls"},
  { time: 11.148, text: "Walk in your" },
  { time: 12.98, text: "rainbow paradise" },
  { time: 20.6, text: "Strawberry" },
  {time: 22.67, text: "lipstick state of mind"},
  {time: 30.5, text: "I get so lost"},
  {time: 32.96, text:"inside your eyes"},
  {time: 36.61, text:"Would you believe it??"},
  {time: 39.64, text:"You don't have to say you love me"},
  {time: 42, text:"You don't have to say nothing"},
  {time: 43, text:"cls"},
  {time: 44.48, text:"You don't have to say you're mine"},
  {time: 48.7, text:"Honey"},
  {time: 49.33, text:"I'd"},
  {time: 52.7, text: "walk through fire for you"},
  {time: 55.2, text:"Just let me adore you"},
  {time: 58, text:"Oh, honey"},
  {time: 59, text:"I'd"},
  {time: 61.2, text:"walk through fire for you"},
  {time: 64.91, text:"Just let me adore you"},
  {time: 66, text:"cls"},
  {time: 66.92,  text:"Like it's the only thing I'll ever do"},
  {time: 71.72, text:"Like it's the only thing I'll ever do"},
  {time: 79, text:"You're wonder"},
  {time: 80.86, text: "under summer skies"},
  {time: 88.7, text:"Brown skin and"},
  {time: 90.56, text: "lemon over ice"},
  {time: 94.78, text:"Would you believe it???"},
  {time: 97.82, text:"You don't have to say you love me"},
  {time: 100.22, text:"I just wanna tell you somethin'"},
  {time: 101, text:"cls"},
  {time: 102.65, text:"Lately you've been on"},
  {time: 104.44, text:"my mind"},
  {time: 106.9, text:"Honey"},
  {time: 107.5, text:"I'd"},
  {time: 110.97, text:"walk through fire for you"},
  {time: 113.38, text:"Just let me adore you"},
  {time: 116.27, text:"Oh, honey"},
  {time: 117.21, text:"I'd"},
  {time: 120.71, text:"walk through fire for you"},
  {time: 122, text:"cls"},
  {time: 123.08, text:"Just let me adore you"},
  {time: 125.1, text:"Like it's the only thing I'll ever do"},
  {time: 129.92, text:"Like it's the only thing I'll ever do"},
  {time: 159.45, text:"I'd walk through fire for you"},
  {time: 161, text:"Just let me adore you"},
  {time: 164, text:"Oh, honey"},
  {time: 156.02, text:"I'd"},
  {time: 159.46, text:"walk through fire for you"}, 
  {time: 161.87, text:"Just let me adore you"},
  {time: 172, text:"cls"},
  {time: 173.87, text:"Like it's the only thing I'll ever do"},
  {time: 175.34, text:"I'd"},
  {time: 178.82, text:"walk through fire for you"}, 
  {time: 181.29, text:"Just let me adore you"},
  {time: 184.144, text:"Oh, honey"},
  {time: 186.57, text:"Oh, honey"},
  {time: 188.54, text: "walk through fire for you"},
  {time: 190.96, text:"Just let me adore you"},
  {time: 196.28, text:"oh, honey"},
  {time: 199, text:"cls"},
  {time: 200.68, text:"Just let me adore you"},
  {time: 202.66, text:"Like it's the only thing I'll ever do..."},
];

const FinaleScreen: React.FC = () => {
  const [lines, setLines] = useState<string[]>([]); // Array of completed lines
  const [currentLine, setCurrentLine] = useState<string>("");
  const [displayedText, setDisplayedText] = useState<string>("");
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const lastProcessedIndex = useRef<number>(-1);

  // 🎵 Create and play audio once
  useEffect(() => {
    const audio = new Audio('/congratulations.mp3');
    audioRef.current = audio;

    audio.play().catch(e => console.error("Audio play failed", e));

    return () => {
      audio.pause();
    };
  }, []);

  // 📝 Sync lyrics with audio time
  useEffect(() => {
    const interval = setInterval(() => {
      if (!audioRef.current) return;

      const currentTime = audioRef.current.currentTime;

      const activeLyricIndex = lyricsData.findIndex((l, idx) => 
        currentTime >= l.time && 
        (idx === lyricsData.length - 1 || currentTime < lyricsData[idx + 1].time)
      );

      if (activeLyricIndex !== -1 && activeLyricIndex !== lastProcessedIndex.current) {
        const activeLyric = lyricsData[activeLyricIndex];
        lastProcessedIndex.current = activeLyricIndex;

        if (activeLyric.text === "cls") {
          // Clear screen command
          setLines([]);
          setCurrentLine("");
          setDisplayedText("");
          setIsTyping(false);
        } else {
          // Move current line to completed lines before starting new one
          if (currentLine && displayedText) {
            setLines(prev => [...prev, displayedText]);
          }
          setCurrentLine(activeLyric.text);
          setIsTyping(true);
        }
      }
    }, 100);

    return () => clearInterval(interval);
  }, [currentLine, displayedText]);

  // ✍️ Typing effect
  useEffect(() => {
    if (!currentLine) return;

    let index = 0;
    setDisplayedText(currentLine.charAt(0)); // Start with first character

    const typeInterval = setInterval(() => {
      index++;
      if (index < currentLine.length) {
        setDisplayedText(currentLine.substring(0, index + 1));
      } else {
        clearInterval(typeInterval);
        setIsTyping(false); // Typing complete, cursor stays flashing
      }
    }, 50);

    return () => clearInterval(typeInterval);
  }, [currentLine]);

  return (
    <div className="finale-container">
      <div className="finale-overlay"></div>
      <div className="finale-content">
        {/* Previously completed lines */}
        {lines.map((line, idx) => (
          <h2 key={idx} className="terminal-text lyric-text">
            {line}
          </h2>
        ))}
        {/* Currently typing/displayed line with cursor */}
        {displayedText && (
          <h2 className="terminal-text lyric-text">
            {displayedText}
            <span className="cursor-block">█</span>
          </h2>
        )}
      </div>
    </div>
  );
};

export default FinaleScreen;