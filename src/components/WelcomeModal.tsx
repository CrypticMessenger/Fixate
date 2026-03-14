import { useEffect, useRef, useState } from 'react';
import { splitWordByORP } from '../lib/orp';

const STORAGE_KEY = 'fixate_welcomed';

const DEMO_TEXT = `Your eyes jump between words when you read — these jumps are called saccades. RSVP eliminates saccades by bringing each word to you. The result is that you spend one hundred percent of your time processing language instead of moving your eyes.`;

const DEMO_WORDS = DEMO_TEXT.split(/\s+/).filter(Boolean);

const SHORTCUTS = [
  { action: 'Play / pause', keys: ['Space'] },
  { action: 'Speed up / down', keys: ['↑', '↓'] },
  { action: 'Jump ±10 words', keys: ['←', '→'] },
  { action: '±sentence', keys: ['[', ']'] },
  { action: 'Cycle theme', keys: ['T'] },
  { action: 'Exit reader', keys: ['Esc'] },
];

/* ── Mini RSVP demo (slide 2) ─────────────────────────────────── */
function MiniReader() {
  const [idx, setIdx] = useState(0);
  const [wpm, setWpm] = useState(300);
  const [playing, setPlaying] = useState(true);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!playing) return;
    const ms = Math.round(60000 / wpm);
    timer.current = setTimeout(() => {
      setIdx(i => (i + 1) % DEMO_WORDS.length);
    }, ms);
    return () => { if (timer.current) clearTimeout(timer.current); };
  }, [idx, wpm, playing]);

  const word = DEMO_WORDS[idx] || '';
  const { before, orp, after } = splitWordByORP(word);

  return (
    <div className="rounded-[14px] border border-[rgba(0,0,0,0.09)] bg-[#f5f3ef] p-4 mt-4">
      {/* word frame */}
      <div className="bg-white rounded-[10px] border border-[rgba(0,0,0,0.08)] h-[72px] flex items-center justify-center overflow-hidden mb-4">
        <div className="flex items-baseline text-[34px] tracking-[2px] whitespace-nowrap font-mono">
          <span className="w-[3em] text-right inline-block whitespace-pre text-[#1a1917]">{before}</span>
          <span className="inline-block text-center whitespace-pre text-[#e85d3a] min-w-[1ch]">{orp || '—'}</span>
          <span className="w-[3em] text-left inline-block whitespace-pre text-[#1a1917]">{after}</span>
        </div>
      </div>

      {/* controls row */}
      <div className="flex items-center gap-3">
        <button
          className="w-9 h-9 rounded-[8px] border border-[rgba(0,0,0,0.12)] bg-white flex items-center justify-center text-[#1a1917] flex-shrink-0 hover:bg-[#f0ede8] transition-colors"
          onClick={() => setPlaying(p => !p)}
        >
          {playing ? (
            <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor"><rect x="2" y="1" width="4" height="12" rx="1"/><rect x="8" y="1" width="4" height="12" rx="1"/></svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor"><path d="M3 1.5l9 5.5-9 5.5z"/></svg>
          )}
        </button>
        <span className="text-[11px] text-[#6b6760] font-mono flex-shrink-0">speed</span>
        <input
          type="range" min={100} max={700} step={25} value={wpm}
          onChange={e => setWpm(Number(e.target.value))}
          className="flex-1 accent-[#e85d3a] h-[3px] cursor-pointer"
        />
        <span className="text-[12px] font-mono font-bold text-[#1a1917] min-w-[56px] text-right flex-shrink-0">
          {wpm} <span className="font-normal text-[#6b6760]">wpm</span>
        </span>
      </div>
      <div className="text-center text-[11px] text-[#a09c96] font-mono mt-2">
        word {idx + 1} of {DEMO_WORDS.length} &middot; {Math.round(((idx + 1) / DEMO_WORDS.length) * 100)}%
      </div>
    </div>
  );
}

/* ── Slide definitions ────────────────────────────────────────── */
function Slide1() {
  return (
    <div>
      <div className="text-[11px] font-mono font-bold tracking-[1.5px] text-[#e85d3a] uppercase mb-2">01 / 03 — The Science</div>
      <h2 className="text-[22px] font-bold text-[#1a1917] leading-[1.25] mb-3">Reading wastes 80% of your time moving your eyes</h2>
      <p className="text-[14px] text-[#6b6760] leading-[1.7] mb-5">
        In traditional reading, your eyes jump between words — these jumps are called <em>saccades</em>. Only ~20% of your reading time is spent processing words. The other 80% is pure eye movement. Fixate eliminates that.
      </p>

      {/* Traditional vs RSVP comparison */}
      <div className="grid grid-cols-[1fr_auto_1fr] gap-2 items-center mb-4">
        <div className="rounded-[10px] border border-[rgba(0,0,0,0.07)] bg-[#f5f3ef] p-3">
          <div className="text-[9px] font-mono font-bold tracking-[1px] uppercase text-[#a09c96] mb-2">Traditional</div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[10px] text-[#6b6760] w-14">moving</span>
            <div className="flex-1 h-[5px] rounded bg-[#e85d3a]/20 overflow-hidden"><div className="h-full bg-[#a09c96]" style={{width:'78%'}}/></div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-[#6b6760] w-14">reading</span>
            <div className="flex-1 h-[5px] rounded bg-[#e85d3a]/20 overflow-hidden"><div className="h-full bg-[#e85d3a]" style={{width:'22%'}}/></div>
          </div>
        </div>
        <span className="text-[11px] text-[#a09c96] font-mono">vs</span>
        <div className="rounded-[10px] border border-[rgba(0,0,0,0.07)] bg-[#f5f3ef] p-3">
          <div className="text-[9px] font-mono font-bold tracking-[1px] uppercase text-[#a09c96] mb-2">RSVP</div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[10px] text-[#6b6760] w-14">moving</span>
            <div className="flex-1 h-[5px] rounded bg-[#e85d3a]/20 overflow-hidden"><div className="h-full bg-[#a09c96]" style={{width:'5%'}}/></div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-[#6b6760] w-14">reading</span>
            <div className="flex-1 h-[5px] rounded bg-[#e85d3a]/20 overflow-hidden"><div className="h-full bg-[#e85d3a]" style={{width:'95%'}}/></div>
          </div>
        </div>
      </div>

      {/* 3 stat chips */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { n: '250', unit: 'wpm', label: 'avg reading speed' },
          { n: '400+', unit: '', label: 'wpm with RSVP' },
          { n: '2×', unit: '', label: 'faster with practice', orange: true },
        ].map(s => (
          <div key={s.label} className="rounded-[10px] border border-[rgba(0,0,0,0.07)] bg-[#f5f3ef] p-3 text-center">
            <div className={`text-[18px] font-bold ${s.orange ? 'text-[#e85d3a]' : 'text-[#1a1917]'}`}>
              {s.n}<span className="text-[13px] font-normal text-[#e85d3a]">{s.unit}</span>
            </div>
            <div className="text-[10px] text-[#a09c96] mt-0.5 leading-[1.3]">{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Slide2() {
  return (
    <div>
      <div className="text-[11px] font-mono font-bold tracking-[1.5px] text-[#e85d3a] uppercase mb-2">02 / 03 — Try it Now</div>
      <h2 className="text-[22px] font-bold text-[#1a1917] leading-[1.25] mb-3">Feel it before you upload anything</h2>
      <p className="text-[14px] text-[#6b6760] leading-[1.7]">
        Words appear one by one at a fixed spot. The <span className="text-[#e85d3a] font-medium">red letter</span> is the Optimal Recognition Point — the exact spot your brain needs to see to process each word.
      </p>
      <MiniReader />
      <div className="mt-3 rounded-[10px] border border-[rgba(232,93,58,0.2)] bg-[rgba(232,93,58,0.05)] px-3 py-2.5 flex gap-2 items-start">
        <span className="text-[#e85d3a] mt-0.5 flex-shrink-0">ℹ</span>
        <p className="text-[12px] text-[#6b6760] leading-[1.6]">Most people feel comfortable around 250–350 wpm. Above 500 wpm takes a few sessions to adjust to.</p>
      </div>
    </div>
  );
}

function Slide3() {
  const KeyBadge = ({ k }: { k: string }) => (
    <span className="inline-flex items-center justify-center min-w-[28px] h-[26px] px-1.5 rounded-[6px] border border-[rgba(0,0,0,0.13)] bg-white text-[11px] font-mono text-[#1a1917] shadow-[0_1px_0_rgba(0,0,0,0.1)]">
      {k}
    </span>
  );

  return (
    <div>
      <div className="text-[11px] font-mono font-bold tracking-[1.5px] text-[#e85d3a] uppercase mb-2">03 / 03 — Controls</div>
      <h2 className="text-[22px] font-bold text-[#1a1917] leading-[1.25] mb-3">Everything at your fingertips</h2>
      <p className="text-[14px] text-[#6b6760] leading-[1.7] mb-4">
        No need to reach for the mouse. Every control has a keyboard shortcut so reading stays uninterrupted.
      </p>

      <div className="grid grid-cols-2 gap-2 mb-4">
        {SHORTCUTS.map(s => (
          <div key={s.action} className="flex items-center justify-between rounded-[10px] bg-[#f5f3ef] border border-[rgba(0,0,0,0.07)] px-3 py-2.5 gap-2">
            <span className="text-[12px] text-[#1a1917]">{s.action}</span>
            <div className="flex gap-1 flex-shrink-0">
              {s.keys.map(k => <KeyBadge key={k} k={k} />)}
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-[10px] border border-[rgba(232,93,58,0.2)] bg-[rgba(232,93,58,0.05)] px-3 py-2.5 flex gap-2 items-start">
        <span className="text-[#e85d3a] mt-0.5 flex-shrink-0">ℹ</span>
        <p className="text-[12px] text-[#6b6760] leading-[1.6]">All settings — theme, ORP highlight, smart pausing, context strip — can be toggled live while reading without losing your place.</p>
      </div>
    </div>
  );
}

/* ── Main modal ───────────────────────────────────────────────── */
interface WelcomeModalProps {
  onDismiss: () => void;
}

export function WelcomeModal({ onDismiss }: WelcomeModalProps) {
  const [slide, setSlide] = useState(0);
  const TOTAL = 3;

  const dismiss = () => {
    localStorage.setItem(STORAGE_KEY, 'true');
    onDismiss();
  };

  const next = () => {
    if (slide < TOTAL - 1) setSlide(s => s + 1);
    else dismiss();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={dismiss} />

      {/* Panel — always light themed */}
      <div className="relative bg-white rounded-[20px] w-full max-w-[460px] shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-0 flex-shrink-0">
          <div className="text-[16px] font-light text-[#1a1917]">
            Fix<b className="text-[#e85d3a] font-semibold">ate</b>
          </div>
          {/* Dot indicators */}
          <div className="flex gap-1.5 absolute left-1/2 -translate-x-1/2">
            {Array.from({ length: TOTAL }).map((_, i) => (
              <button
                key={i}
                onClick={() => setSlide(i)}
                className={`rounded-full transition-all ${i === slide ? 'w-[22px] h-[7px] bg-[#e85d3a]' : 'w-[7px] h-[7px] bg-[rgba(0,0,0,0.15)]'}`}
              />
            ))}
          </div>
          <button
            onClick={dismiss}
            className="w-8 h-8 rounded-[8px] border border-[rgba(0,0,0,0.1)] bg-[#f5f3ef] flex items-center justify-center text-[#6b6760] hover:bg-[#eeece8] transition-colors text-[14px]"
          >
            ✕
          </button>
        </div>

        {/* Slide content */}
        <div className="flex-1 overflow-y-auto px-6 pt-5 pb-2">
          {slide === 0 && <Slide1 />}
          {slide === 1 && <Slide2 />}
          {slide === 2 && <Slide3 />}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-[rgba(0,0,0,0.06)] flex-shrink-0">
          <button
            onClick={dismiss}
            className="text-[13px] text-[#6b6760] border border-[rgba(0,0,0,0.12)] rounded-[10px] px-4 py-2 hover:bg-[#f5f3ef] transition-colors"
          >
            skip intro
          </button>
          <button
            onClick={next}
            className="text-[13px] font-semibold text-[#1a1917] border border-[rgba(0,0,0,0.15)] rounded-[10px] px-5 py-2 hover:bg-[#f5f3ef] transition-colors flex items-center gap-1.5"
          >
            {slide < TOTAL - 1 ? <>Next <span>→</span></> : 'Get started'}
          </button>
        </div>
      </div>
    </div>
  );
}

/** Returns true if this is the user's first visit */
export function isFirstVisit(): boolean {
  try {
    return !localStorage.getItem(STORAGE_KEY);
  } catch {
    return false;
  }
}
