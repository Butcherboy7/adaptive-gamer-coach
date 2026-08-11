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
    const duration = 1500;
    const animate = (timestamp) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 4);
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
  const cx = 120, cy = 95, r = 70;
  const totalAngle = 180;

  const toRad = (deg) => (deg * Math.PI) / 180;
  const polarToCart = (cx, cy, r, deg) => ({
    x: cx + r * Math.cos(toRad(deg)),
    y: cy + r * Math.sin(toRad(deg)),
  });

  const bgStart = polarToCart(cx, cy, r, -180);
  const bgEnd   = polarToCart(cx, cy, r, 0);
  const bgPath = `M ${bgStart.x} ${bgStart.y} A ${r} ${r} 0 0 1 ${bgEnd.x} ${bgEnd.y}`;

  const fgAngle = -180 + (animatedProb * totalAngle);
  const fgEnd = polarToCart(cx, cy, r, fgAngle);
  const largeArc = 0; 
  
  const fgPath = animatedProb > 0
    ? `M ${bgStart.x} ${bgStart.y} A ${r} ${r} 0 ${largeArc} 1 ${fgEnd.x} ${fgEnd.y}`
    : '';

  const gaugeColor = riskLevel === 'LOW' ? '#00ff88'
                   : riskLevel === 'MEDIUM' ? '#fbbf24'
                   : '#ff2d55';

  const blinkColors = { LOW: 'bg-[#00ff88]', MEDIUM: 'bg-[#fbbf24]', HIGH: 'bg-[#ff2d55]' };

  return (
    <div className="card flex flex-col items-center justify-between p-4 h-full">
      <h3 className="font-orbitron text-xs tracking-widest text-[#64748b] mb-1">RAGE-QUIT RISK</h3>
      
      <svg width="220" height="115" viewBox="0 0 240 120" className="overflow-visible my-1">
        <defs>
          <linearGradient id="gauge-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#00ff88" />
            <stop offset="50%" stopColor="#fbbf24" />
            <stop offset="100%" stopColor="#ff2d55" />
          </linearGradient>
        </defs>
        
        {/* Background track */}
        <path d={bgPath} fill="none" stroke="#1e1e2e" strokeWidth="12" strokeLinecap="round" />
        <path d={bgPath} fill="none" stroke="url(#gauge-gradient)" strokeWidth="12" strokeLinecap="round" opacity="0.12" />
        
        {/* Active arc */}
        {fgPath && (
          <path d={fgPath} fill="none" stroke={gaugeColor} strokeWidth="12"
            strokeLinecap="round"
            style={{ filter: `drop-shadow(0 0 8px ${gaugeColor})` }}
            className="transition-all duration-300"
          />
        )}

        {/* Dot */}
        {fgPath && (
          <circle 
            cx={fgEnd.x} cy={fgEnd.y} r="4.5" 
            fill="#fff" 
            style={{ filter: `drop-shadow(0 0 8px ${gaugeColor})` }}
          />
        )}
        
        {/* Center Text */}
        <text x={cx} y={cy - 4} textAnchor="middle"
          fill={gaugeColor} fontSize="34" fontWeight="900" fontFamily="JetBrains Mono"
          style={{ filter: `drop-shadow(0 0 10px ${gaugeColor}aa)` }}>
          {Math.round(displayPercent)}%
        </text>
        <text x={cx} y={cy + 16} textAnchor="middle"
          fill="#64748b" fontSize="10" fontFamily="Orbitron" letterSpacing="3" opacity="0.7">
          RAGE RISK
        </text>
        
        <text x="40" y="112" textAnchor="middle" fill="#475569" fontSize="9" fontFamily="Orbitron" fontWeight="bold">0%</text>
        <text x="200" y="112" textAnchor="middle" fill="#475569" fontSize="9" fontFamily="Orbitron" fontWeight="bold">100%</text>
      </svg>
      
      {/* Status Pill */}
      <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#1e1e2e] border border-white/5 shadow-md">
        <span className={`w-2 h-2 rounded-full ${blinkColors[riskLevel]} animate-pulse`} 
          style={{ boxShadow: `0 0 10px ${gaugeColor}` }}/>
        <span className="font-orbitron text-[10px] font-black tracking-widest"
          style={{ color: gaugeColor, textShadow: `0 0 8px ${gaugeColor}44` }}>
          {riskLevel} RISK
        </span>
      </div>
    </div>
  );
}

export default function RiskGauge({ data }) {
  if (!data) return (
    <div className="card flex flex-col items-center justify-center h-full min-h-[190px] text-[#64748b] bg-[#12121a] border border-[#1e1e2e]">
      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#00ff88] mb-2" />
      <span className="font-orbitron text-[10px] tracking-widest uppercase">Awaiting Neural Analysis...</span>
    </div>
  );

  return (
    <SemiGauge
      probability={data.rage_probability}
      riskLevel={data.rage_risk_level}
    />
  );
}
