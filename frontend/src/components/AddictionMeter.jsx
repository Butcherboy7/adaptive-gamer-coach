import { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const CATEGORY_CONFIG = {
  Low:    { color: '#00ff88', label: 'LOW',    index: 0 },
  Medium: { color: '#fbbf24', label: 'MEDIUM', index: 1 },
  High:   { color: '#ff2d55', label: 'HIGH',   index: 2 },
};

function generateTrendData(probabilities, category) {
  const baseProb = probabilities?.[category] || 0.5;
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const seed = baseProb * 1000;
  
  return days.map((day, i) => {
    const noise = (Math.sin(seed + i * 13.7) * 0.5 + 0.5) * 0.2 - 0.1;
    return {
      day,
      risk: Math.max(0, Math.min(1, baseProb + noise)),
    };
  });
}

const CustomTooltip = ({ active, payload, label, color }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#12121a] border border-[#1e1e2e] rounded px-2.5 py-1.5 text-[11px] shadow-xl">
        <p className="text-[#64748b]">{label}</p>
        <p style={{ color }} className="font-mono font-bold">
          {(payload[0].value * 100).toFixed(0)}% risk
        </p>
      </div>
    );
  }
  return null;
};

export default function AddictionMeter({ data }) {
  const trendData = useMemo(() =>
    generateTrendData(data?.addiction_probabilities, data?.addiction_category),
    [data]
  );

  const category = data?.addiction_category || null;
  const config = category ? CATEGORY_CONFIG[category] : null;

  return (
    <div className="card flex flex-col justify-between p-4 h-full">
      <div>
        <h3 className="font-orbitron text-xs tracking-widest text-[#64748b] mb-3">ADDICTION LEVEL</h3>
        
        {/* Pills */}
        <div className="flex gap-2 mb-3">
          {Object.entries(CATEGORY_CONFIG).map(([key, cfg]) => {
            const isActive = key === category;
            return (
              <div
                key={key}
                className="flex-1 text-center py-1.5 rounded-lg font-orbitron text-[11px] font-bold tracking-widest transition-all duration-300"
                style={{
                  background: isActive ? cfg.color + '22' : '#1e1e2e',
                  border: `1px solid ${isActive ? cfg.color : '#1e1e2e'}`,
                  color: isActive ? cfg.color : '#64748b',
                  boxShadow: isActive ? `0 0 10px ${cfg.color}66` : 'none',
                }}
              >
                {cfg.label}
              </div>
            );
          })}
        </div>
      </div>

      {/* 7-day area chart */}
      {data ? (
        <div>
          <p className="text-[11px] text-[#64748b] mb-1 font-mono">7-Day Risk Trend</p>
          <ResponsiveContainer width="100%" height={85}>
            <AreaChart data={trendData} margin={{ top: 5, right: 5, bottom: 0, left: -32 }}>
              <defs>
                <linearGradient id="area-gradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={config?.color || '#00ff88'} stopOpacity={0.4} />
                  <stop offset="100%" stopColor={config?.color || '#00ff88'} stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="day" tick={{ fill: '#64748b', fontSize: 9 }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 1]} tick={{ fill: '#64748b', fontSize: 8 }} />
              <Tooltip content={<CustomTooltip color={config?.color || '#00ff88'} />} />
              <Area
                type="monotone"
                dataKey="risk"
                stroke={config?.color || '#00ff88'}
                strokeWidth={2}
                fill="url(#area-gradient)"
                dot={{ fill: config?.color || '#00ff88', r: 2.5, strokeWidth: 0 }}
                isAnimationActive={true}
                animationDuration={1000}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-6 text-center">
          <span className="font-orbitron text-[10px] text-[#64748b] tracking-widest uppercase">Awaiting Neural Trends...</span>
        </div>
      )}
    </div>
  );
}
