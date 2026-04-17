import { useEffect, useState } from 'react';

// ─── Animated counter hook ───
function useCountUp(target, duration = 1200) {
  const [current, setCurrent] = useState(0);
  useEffect(() => {
    if (target === 0) { setCurrent(0); return; }
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCurrent(target); clearInterval(timer); }
      else setCurrent(start);
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);
  return current;
}

// ─── SVG Semicircular Gauge ───
function SemiGauge({ probability, riskLevel }) {
  const [animProgress, setAnimProgress] = useState(0);
  
  useEffect(() => {
    let frame;
    let start = null;
    const duration = 1200;
    const animate = (timestamp) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // cubic ease-out
      setAnimProgress(eased);
      if (progress < 1) frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [probability]);

  const percent = probability * 100;
  const displayPercent = useCountUp(percent);
  const animatedProb = animProgress * probability;

  // SVG arc math
  const cx = 120, cy = 110, r = 90;
  const startAngle = -180;  // left (0%)
  const endAngle = 0;       // right (100%)
  const totalAngle = 180;

  const toRad = (deg) => (deg * Math.PI) / 180;
  const polarToCart = (cx, cy, r, deg) => ({
    x: cx + r * Math.cos(toRad(deg)),
    y: cy + r * Math.sin(toRad(deg)),
  });

  // Background arc (full semicircle)
  const bgStart = polarToCart(cx, cy, r, -180);
  const bgEnd   = polarToCart(cx, cy, r, 0);
  const bgPath = `M ${bgStart.x} ${bgStart.y} A ${r} ${r} 0 0 1 ${bgEnd.x} ${bgEnd.y}`;

  // Foreground arc (animated)
  const fgAngle = -180 + (animatedProb * totalAngle);
  const fgEnd = polarToCart(cx, cy, r, fgAngle);
  const largeArc = animatedProb > 0.5 ? 1 : 0;
  const fgPath = animatedProb > 0
    ? `M ${bgStart.x} ${bgStart.y} A ${r} ${r} 0 ${largeArc} 1 ${fgEnd.x} ${fgEnd.y}`
    : '';

  // Color based on risk
  const gaugeColor = riskLevel === 'LOW' ? '#00ff88'
                   : riskLevel === 'MEDIUM' ? '#fbbf24'
                   : '#ff2d55';

  const blinkColors = { LOW: 'bg-[#00ff88]', MEDIUM: 'bg-[#fbbf24]', HIGH: 'bg-[#ff2d55]' };

  return (
    <div className="card flex flex-col items-center">
      <h3 className="font-orbitron text-xs tracking-widest text-[#64748b] mb-3">RAGE-QUIT RISK</h3>
      
      <svg width="240" height="130" viewBox="0 0 240 130">
        {/* Gradient def */}
        <defs>
          <linearGradient id="gauge-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#00ff88" />
            <stop offset="50%" stopColor="#fbbf24" />
            <stop offset="100%" stopColor="#ff2d55" />
          </linearGradient>
        </defs>
        
        {/* Zone arcs (background) */}
        <path d={bgPath} fill="none" stroke="#1e1e2e" strokeWidth="16" strokeLinecap="round" />
        
        {/* Gradient reference track */}
        <path d={bgPath} fill="none" stroke="url(#gauge-gradient)" strokeWidth="16"
          strokeLinecap="round" opacity="0.15" />
        
        {/* Animated foreground arc */}
        {fgPath && (
          <path d={fgPath} fill="none" stroke={gaugeColor} strokeWidth="16"
            strokeLinecap="round"
            style={{ filter: `drop-shadow(0 0 6px ${gaugeColor})` }} />
        )}
        
        {/* Center percentage */}
        <text x={cx} y={cy - 10} textAnchor="middle"
          fill={gaugeColor} fontSize="32" fontWeight="bold" fontFamily="JetBrains Mono"
          style={{ filter: `drop-shadow(0 0 8px ${gaugeColor})` }}>
          {Math.round(displayPercent)}%
        </text>
        <text x={cx} y={cy + 14} textAnchor="middle"
          fill="#64748b" fontSize="10" fontFamily="Orbitron" letterSpacing="3">
          RAGE RISK
        </text>
        
        {/* Scale labels */}
        <text x="20" y="118" fill="#64748b" fontSize="9" fontFamily="Inter">0%</text>
        <text x="198" y="118" fill="#64748b" fontSize="9" fontFamily="Inter">100%</text>
      </svg>
      
      {/* Risk level indicator */}
      <div className="flex items-center gap-2 mt-1">
        <span className={`w-2 h-2 rounded-full ${blinkColors[riskLevel]} animate-pulse`} />
        <span className="font-orbitron text-sm font-bold tracking-widest"
          style={{ color: gaugeColor, textShadow: `0 0 8px ${gaugeColor}88` }}>
          {riskLevel} RISK
        </span>
      </div>
    </div>
  );
}

export default function RiskGauge({ data }) {
  if (!data) return (
    <div className="card flex items-center justify-center h-48 text-[#64748b] text-sm">
      <span>Awaiting analysis...</span>
    </div>
  );
  return (
    <SemiGauge
      probability={data.rage_probability}
      riskLevel={data.rage_risk_level}
    />
  );
}
