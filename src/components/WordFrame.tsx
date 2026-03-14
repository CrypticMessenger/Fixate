import React, { useMemo } from 'react';
import clsx from 'clsx';
import { splitWordByORP } from '../lib/orp';

interface WordFrameProps {
  word: string;
  wpm: number;
  wordIndex: number;
  totalWords: number;
  orpEnabled?: boolean;
  isPlaying?: boolean;
  fontSize?: number;
  fontFamily?: string;
}

export const WordFrame: React.FC<WordFrameProps> = ({ 
  word, 
  wpm, 
  wordIndex, 
  totalWords, 
  orpEnabled = true,
  isPlaying = false,
  fontSize = 38,
  fontFamily = "'Courier New', monospace"
}) => {
  const { before, orp, after } = splitWordByORP(word || ' ');

  // Dynamically scale down font size for very long words so they always fit inside the frame
  const effectiveFontSize = useMemo(() => {
    const wordLength = word?.length ?? 1;
    if (wordLength <= 7) return fontSize;
    if (wordLength <= 10) return Math.round(fontSize * 0.9);
    if (wordLength <= 14) return Math.round(fontSize * 0.75);
    return Math.round(fontSize * 0.6);
  }, [word, fontSize]);

  return (
    <div className="flex flex-col items-center justify-center my-8 select-none w-full px-4 text-center">
      <div 
        className={clsx(
          "w-full max-w-[520px] min-h-[92px] border border-border2 rounded-[20px] bg-bg2",
          "flex items-center justify-center relative transition-shadow duration-200 overflow-hidden px-8"
        )}
        style={{ boxShadow: isPlaying ? '0 0 28px var(--orp-bg)' : undefined }}
      >
        {!isPlaying && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#0e0e0f8c] rounded-[20px] text-[11px] font-mono text-text2 tracking-[1.5px] uppercase z-10 pointer-events-none backdrop-blur-[1px]">
            paused &middot; space to play
          </div>
        )}
        <div 
          className="flex items-baseline tracking-[3px] text-text whitespace-nowrap transition-[font-size] duration-150"
          style={{ fontSize: `${effectiveFontSize}px`, fontFamily }}
        >
          {/* Increased to 5em to prevent clipping common long words while keeping ORP centered */}
          <span className="w-[5em] text-right inline-block whitespace-pre text-text">{before}</span>
          <span className={clsx("inline-block text-center whitespace-pre min-w-[1ch]", orpEnabled && "text-orp")}>
            {orp || '\u2014'}
          </span>
          <span className="w-[5em] text-left inline-block whitespace-pre text-text">{after}</span>
        </div>
      </div>
      
      <div className="mt-[9px] text-[11px] text-text3 font-mono flex gap-3">
        <span><b className="text-text2 font-medium">{wpm}</b> wpm</span>
        <span><b className="text-text2 font-medium">{(wordIndex + 1).toLocaleString()}</b> / {totalWords.toLocaleString()}</span>
      </div>
    </div>
  );
};

