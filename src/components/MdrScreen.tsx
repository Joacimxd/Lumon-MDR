import React, { useState, useEffect, useRef } from 'react';
import './CRTTerminal.css';
import Logo from './Logo.tsx';

interface MdrCell {
    val: number;
    id: string;
    offset: number;
    targetBin: number; // 0-2
    status: 'idle' | 'captured';
    audioId?: number; // 1-3 if special cell
}

interface MdrScreenProps {
    fileName: string;
    binProgress: number[];
    onBinUpdate: (binIndex: number, value: number) => void;
    onBack: () => void;
}

const MdrScreen: React.FC<MdrScreenProps> = ({ fileName, binProgress, onBinUpdate, onBack }) => {
    const [mdrGrid, setMdrGrid] = useState<MdrCell[][]>([]);
    const [mousePos, setMousePos] = useState({ x: -100, y: -100 });
    const [failureActive, setFailureActive] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const audioRefs = useRef<HTMLAudioElement[]>([]); // Store Audio elements 0-3 (for 1.mp3...4.mp3)


    // Initial Grid Generation
    useEffect(() => {
        const rows = 12;
        const cols = 18;
        const newGrid = Array.from({ length: rows }, (_, r) =>
            Array.from({ length: cols }, (_, c) => {
                const val = Math.floor(Math.random() * 10);
                
                let targetBin = -1;
                if (val === 1) targetBin = 3;
                else if (val === 2) targetBin = 0;
                else if (val === 3) targetBin = 1;
                else if (val === 4) targetBin = 2;
                else targetBin = Math.floor(Math.random() * 4); 

                return {
                    val,
                    id: `${r}-${c}`,
                    offset: Math.random() * 2000,
                    targetBin,
                    status: 'idle' as const
                };
            })
        );

        // Assign audioId 1-3 to 3 random UNIQUE cells with SPATIAL CHECK
        const audioIds = [1, 2, 3];
        let assignedCount = 0;
        let attempts = 0;
        
        while (assignedCount < 3 && attempts < 200) {
            attempts++;
            const r = Math.floor(Math.random() * rows);
            const c = Math.floor(Math.random() * cols);
            const cell = newGrid[r][c] as MdrCell;
            
            // Check distance from existing audio cells
            let tooClose = false;
            for (let ar = 0; ar < rows; ar++) {
                for (let ac = 0; ac < cols; ac++) {
                    const existing = newGrid[ar][ac] as MdrCell;
                    if (existing.audioId) {
                        const dist = Math.sqrt(Math.pow(ar - r, 2) + Math.pow(ac - c, 2));
                        if (dist < 4) { // Min distance of 4 cells
                            tooClose = true;
                            break;
                        }
                    }
                }
                if (tooClose) break;
            }

            if (!cell.audioId && !tooClose) {
                cell.audioId = audioIds[assignedCount];
                cell.targetBin = audioIds[assignedCount] - 1;
                assignedCount++;
            }
        }
        
        // Fallback if placement failed (rare) - place loosely
        if (assignedCount < 3) {
             // ... handle fallback or just accept fewer sources
        }

        setMdrGrid(newGrid);
        setFailureActive(false);

        // Cleanup previous audios
        audioRefs.current.forEach(audio => {
            audio.pause();
            audio.currentTime = 0;
        });
        audioRefs.current = [];

        // Init new Audios with Folder Path
        [1, 2, 3].forEach(id => {
            const audioPath = `/${fileName}/${id}.mp3`;
            const audio = new Audio(audioPath);
            audio.loop = true;
            audio.volume = 0;
            audio.play().catch(e => console.log("Audio autoplay blocked", e));
            audioRefs.current.push(audio);
        });

    }, [fileName]);

    // Cleanup audio on unmount
    useEffect(() => {
        return () => {
             audioRefs.current.forEach(audio => audio.pause());
        };
    }, []);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!containerRef.current) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        setMousePos({ x, y });

        // Update Audio Volumes - ISOLATION LOGIC
        // Find closest audio source
        let closestDist = Infinity;
        let closestAudioId = -1;

        mdrGrid.forEach((row, r) => {
            row.forEach((cell, c) => {
                if (cell.audioId && cell.status === 'idle') {
                     // Check if bin logic allows (stop if already full? User said "If the corresponding song is already on the bin stop playing it")
                     // binIndex = cell.audioId - 1.
                     // But wait, status 'idle' implies not captured. 
                     // If user meant "if bin is full from PREVIOUS session", then we check binProgress.
                     // The requirement: "If the corresponding song is already on the bin stop playing it".
                     // This could mean: if the bin is 100%, mute it.
                     // My persistent state handles 100%. So if binProgress[audioId-1] === 100, we should treat it as 'done' and not play.
                     
                     if (binProgress[cell.audioId - 1] === 100) return;

                     const cellCenterX = c * 35 + 17;
                     const cellCenterY = r * 30 + 15;
                     const dist = Math.sqrt(Math.pow(x - cellCenterX, 2) + Math.pow(y - cellCenterY, 2));
                     
                     if (dist < closestDist) {
                         closestDist = dist;
                         closestAudioId = cell.audioId;
                     }
                }
            });
        });

        // Apply volumes
        audioRefs.current.forEach((audio, idx) => {
            const audioId = idx + 1;
            if (audioId === closestAudioId && closestDist < 300) {
                 // Play this one
                 let volume = 0;
                 if (closestDist < 50) volume = 1;
                 else volume = 1 - (closestDist - 50) / 250;
                 audio.volume = volume;
            } else {
                 // Mute others
                 audio.volume = 0;
            }
        });
    };

    // Keyboard Handler
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
             const key = parseInt(e.key);
             if ([1, 2, 3].includes(key)) {
                 handleBinSelection(key - 1);
             }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [mdrGrid, mousePos, failureActive]);

    const handleBinSelection = (binIndex: number) => {
        if (failureActive) return;

        // Radius Search Logic (User requested ~4 blocks radius, ~140px)
        const CAPTURE_RADIUS = 140;
        let captured = false;
        
        const newGrid = mdrGrid.map(row => row.map(cell => {
             // Only check audio cells matching the key (binIndex + 1)
             // binIndex 0 -> Key 1 -> Audio 1
             if (cell.audioId === (binIndex + 1) && cell.status === 'idle') {
                 const cellCenterX = parseInt(cell.id.split('-')[1]) * 35 + 17;
                 const cellCenterY = parseInt(cell.id.split('-')[0]) * 30 + 15;
                 
                 const dist = Math.sqrt(
                     Math.pow(mousePos.x - cellCenterX, 2) + 
                     Math.pow(mousePos.y - cellCenterY, 2)
                 );
                 
                 if (dist < CAPTURE_RADIUS) {
                     captured = true;
                     return { ...cell, status: 'captured' as const };
                 }
             }
             return cell;
        }));

        if (captured) {
            setMdrGrid(newGrid);
            
            // Instant Fill
            const currentVal = binProgress[binIndex];
            if (currentVal < 100) {
                 onBinUpdate(binIndex, 100);
            }
        } else {
            setFailureActive(true);
            setTimeout(() => setFailureActive(false), 1000);
        }
    };

    // Calculate file progress for header
    const fileProgress = binProgress.reduce((sum, val) => sum + (val === 100 ? 33 : 0), 0) + (binProgress.every(v => v === 100) ? 1 : 0);

    return (
        <div className="mdr-container amber-text retro-cursor-area">
            <div className="mdr-header">
            
            <button className="mdr-back-btn" onClick={onBack}>BACK</button>

            <div className="mdr-file-name">
                {fileName}
            </div>
            <div className="mdr-progress">
                {fileProgress}% Complete
            </div>
                <Logo />
            </div>

            <div 
            className="mdr-grid"
            ref={containerRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={() => {
                setMousePos({ x: -1000, y: -1000 });
                // Mute all audio on leave
                audioRefs.current.forEach(audio => {
                    audio.volume = 0;
                });
            }}
            >
            {mdrGrid.map((row, rIndex) => (
                <div key={rIndex} className="mdr-row">
                    {row.map((cell, cIndex) => {
                        const cellCenterX = cIndex * 35 + 17;
                        const cellCenterY = rIndex * 30 + 15;
                        const dist = Math.sqrt(
                            Math.pow(mousePos.x - cellCenterX, 2) + 
                            Math.pow(mousePos.y - cellCenterY, 2)
                        );
                        
                        let scale = 1;
                        if (dist < 100) {
                            scale = 1 + (1 - dist / 100) * 0.8; 
                        }

                        return (
                            <span 
                                key={cell.id} 
                                className={`mdr-cell retro-cursor ${cell.status === 'captured' ? 'captured' : ''} ${cell.audioId ? 'audio-cell' : ''}`}
                                data-target-bin={cell.targetBin}
                                style={{
                                    animationDelay: `${cell.offset}ms`,
                                    transform: cell.status === 'captured' ? 'scale(0)' : `scale(${scale}) translateY(0px)`,
                                    opacity: cell.status === 'captured' ? 0 : 1,
                                    pointerEvents: cell.status === 'captured' ? 'none' : 'auto',
                                    transition: 'transform 0.5s ease-in, opacity 0.5s ease-in',
                                    // Debug visual aid? Or keep hidden? "noise" implies hidden visually maybe.
                                    // Taking user request literally: "four numbers to have a noise".
                                    // I will NOT add visual distinction unless asked, to rely on audio.
                                    border: cell.audioId ? '1px solid rgba(255,255,255,0.05)' : 'none' // Subtle hint
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
            {["01", "02", "03"].map((bin, idx) => (
                <div key={bin} className="mdr-bin">
                    <div className="bin-label">{bin}</div>
                    <div className="bin-bar-container">
                        <div className="bin-bar" style={{width: `${binProgress[idx]}%`}}></div>
                        <div className="bin-percent">{binProgress[idx]}%</div>
                    </div>
                </div>
            ))}
            </div>

            
            
            {failureActive && (
                <div className="failure-overlay">
                    X
                </div>
            )}
        </div>
    );
};

export default MdrScreen;
