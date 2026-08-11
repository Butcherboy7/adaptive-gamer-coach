import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  PolarRadiusAxis, ResponsiveContainer, Tooltip
} from 'recharts';

const AXIS_LABELS = {
  stress_level:      'STRESS',
  anxiety_score:     'ANXIETY',
  loneliness_score:  'ISOLATION',
  gaming_intensity:  'GAMING',
  sleep_deprivation: 'SLEEP RISK',
  social_score:      'SOCIAL',
};

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#12121a] border border-[#1e1e2e] rounded px-2.5 py-1.5 text-[11px] shadow-2xl backdrop-blur-md">
        <p className="text-[#00ff88] font-orbitron font-bold tracking-wider">
          {payload[0].payload.axis}: {payload[0].value.toFixed(1)}/10
        </p>
      </div>
    );
  }
  return null;
};

const CustomDot = (props) => {
  const { cx, cy } = props;
  return (
    <g>
      <circle cx={cx} cy={cy} r={4} fill="#00ff88" opacity="0.4" />
      <circle cx={cx} cy={cy} r={2.5} fill="#fff" stroke="#00ff88" strokeWidth={1.5}
        style={{ filter: 'drop-shadow(0 0 4px #00ff88)' }} />
    </g>
  );
};

export default function StatsRadar({ data }) {
  const radarData = data?.input_summary ? Object.entries(data.input_summary).map(([key, val]) => ({
    axis: AXIS_LABELS[key] || key.replace('_', ' ').toUpperCase(),
    value: Math.min(10, Math.max(0, val)),
    fullMark: 10,
  })) : [
    { axis: 'STRESS',     value: 0, fullMark: 10 },
    { axis: 'ANXIETY',    value: 0, fullMark: 10 },
    { axis: 'ISOLATION',  value: 0, fullMark: 10 },
    { axis: 'GAMING',     value: 0, fullMark: 10 },
    { axis: 'SLEEP RISK', value: 0, fullMark: 10 },
    { axis: 'SOCIAL',     value: 0, fullMark: 10 },
  ];

  return (
    <div className="card relative overflow-hidden group h-full flex flex-col justify-between p-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-orbitron text-xs tracking-[0.18em] text-[#64748b] flex items-center gap-2">
          <span className="w-1 h-3 bg-[#00ff88] rounded-full" />
          BEHAVIORAL PROFILE
        </h3>
        <span className="text-[10px] font-mono text-[#64748b]">RADAR MAP</span>
      </div>
      
      <div className="w-full h-[200px] flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={radarData} margin={{ top: 15, right: 25, bottom: 15, left: 25 }}>
            <PolarGrid stroke="#334155" strokeWidth={0.5} strokeDasharray="3 3" />
            <PolarAngleAxis
              dataKey="axis"
              tick={{ fill: '#94a3b8', fontSize: 9, fontFamily: 'Orbitron', fontWeight: 600 }}
            />
            <PolarRadiusAxis
              angle={90}
              domain={[0, 10]}
              tick={false}
              axisLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Radar
              name="Profile"
              dataKey="value"
              stroke="#00ff88"
              strokeWidth= {2.5}
              fill="#00ff88"
              fillOpacity={0.15}
              dot={<CustomDot />}
              isAnimationActive={true}
              animationDuration={1200}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
      
      {!data && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px] transition-all duration-500">
           <p className="text-center text-[10px] font-orbitron tracking-widest text-[#64748b] uppercase animate-pulse">
            Awaiting Neural Mapping...
          </p>
        </div>
      )}
    </div>
  );
}
