import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  PolarRadiusAxis, ResponsiveContainer, Tooltip
} from 'recharts';

const AXIS_LABELS = {
  stress_level:    'Stress',
  anxiety_score:   'Anxiety',
  loneliness_score:'Loneliness',
  gaming_intensity:'Gaming',
  sleep_quality:   'Sleep Risk',
  social_score:    'Social',
};

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#12121a] border border-[#1e1e2e] rounded px-3 py-2 text-xs">
        <p className="text-[#00ff88] font-mono font-bold">
          {payload[0].payload.axis}: {payload[0].value.toFixed(1)}/10
        </p>
      </div>
    );
  }
  return null;
};

const CustomDot = (props) => {
  const { cx, cy } = props;
  return <circle cx={cx} cy={cy} r={4} fill="#00ff88" stroke="#0a0a0f" strokeWidth={2}
    style={{ filter: 'drop-shadow(0 0 4px #00ff88)' }} />;
};

export default function StatsRadar({ data }) {
  const radarData = data?.input_summary ? Object.entries(data.input_summary).map(([key, val]) => ({
    axis: AXIS_LABELS[key] || key,
    value: Math.min(10, Math.max(0, val)),
    fullMark: 10,
  })) : [
    { axis: 'Stress',     value: 0, fullMark: 10 },
    { axis: 'Anxiety',    value: 0, fullMark: 10 },
    { axis: 'Loneliness', value: 0, fullMark: 10 },
    { axis: 'Gaming',     value: 0, fullMark: 10 },
    { axis: 'Sleep Risk', value: 0, fullMark: 10 },
    { axis: 'Social',     value: 0, fullMark: 10 },
  ];

  return (
    <div className="card">
      <h3 className="font-orbitron text-xs tracking-widest text-[#64748b] mb-4">BEHAVIORAL PROFILE</h3>
      <ResponsiveContainer width="100%" height={220}>
        <RadarChart data={radarData} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
          <PolarGrid stroke="#1e1e2e" strokeWidth={1} />
          <PolarAngleAxis
            dataKey="axis"
            tick={{ fill: '#64748b', fontSize: 11, fontFamily: 'Rajdhani' }}
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 10]}
            tick={{ fill: '#1e1e2e', fontSize: 8 }}
            axisLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Radar
            name="Profile"
            dataKey="value"
            stroke="#00ff88"
            strokeWidth={2}
            fill="#00ff88"
            fillOpacity={0.2}
            dot={<CustomDot />}
            isAnimationActive={true}
            animationDuration={1200}
          />
        </RadarChart>
      </ResponsiveContainer>
      {!data && (
        <p className="text-center text-xs text-[#64748b] mt-2">
          Submit your profile to see behavioral analysis
        </p>
      )}
    </div>
  );
}
