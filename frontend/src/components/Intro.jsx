import { useEffect, useState } from 'react';
import { INTRO_MS } from '../motion';

// Broadcast-style opener: the mark draws, the name slams in on a red slate,
// then the whole card wipes off on a slant. Click anywhere to skip.
export default function Intro() {
  const [gone, setGone] = useState(INTRO_MS === 0);
  const [skipped, setSkipped] = useState(false);

  useEffect(() => {
    if (gone) return undefined;
    const t = setTimeout(() => setGone(true), INTRO_MS + 650);
    return () => clearTimeout(t);
  }, [gone]);

  if (gone) return null;
  return (
    <div className={`intro ${skipped ? 'is-skipped' : ''}`} aria-hidden onClick={() => { setSkipped(true); setTimeout(() => setGone(true), 300); }}>
      <div className="intro-card">
        <svg className="intro-mark" width="76" height="76" viewBox="0 0 32 32">
          <path className="intro-mark-line" d="M4 26 L16 4 L28 26 Z" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinejoin="round" pathLength="1" />
          <path className="intro-mark-wedge" d="M10 26 L16 15 L22 26" fill="var(--red)" />
        </svg>
        <div className="intro-name">
          <span className="intro-slate" />
          <span className="intro-line"><span>Adaptive Gamer</span></span>
          <span className="intro-line intro-line-b"><span>Coach</span></span>
        </div>
        <p className="intro-tag">Tilt &amp; addiction intelligence for players</p>
      </div>
      <span className="intro-sweep" />
    </div>
  );
}
