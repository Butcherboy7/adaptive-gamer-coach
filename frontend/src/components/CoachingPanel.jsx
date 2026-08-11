const CATEGORY_COLORS = {
  break:    '#ff2d55',
  health:   '#00d4ff',
  gameplay: '#7c3aed',
  mental:   '#00ff88',
};

const CATEGORY_LABELS = {
  break:    'REST',
  health:   'HEALTH',
  gameplay: 'GAMEPLAY',
  mental:   'MENTAL',
};

function TipCard({ tip, index }) {
  const color = CATEGORY_COLORS[tip.category] || '#00d4ff';
  
  return (
    <div
      className="animate-in rounded-lg p-2.5 mb-2 last:mb-0 transition-all duration-200 hover:brightness-110 cursor-default"
      style={{
        background: '#12121a',
        border: '1px solid #1e1e2e',
        borderLeft: `3px solid ${color}`,
        animationDelay: `${index * 120}ms`,
        animationFillMode: 'both',
      }}
    >
      <div className="flex items-center gap-2.5">
        <span className="text-lg flex-shrink-0">{tip.icon}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span
              className="text-[9px] font-orbitron font-bold px-1.5 py-0.2 rounded"
              style={{
                color,
                background: color + '22',
                border: `1px solid ${color}44`,
                letterSpacing: '0.08em',
              }}
            >
              {CATEGORY_LABELS[tip.category] || tip.category.toUpperCase()}
            </span>
          </div>
          <p className="text-xs text-[#e2e8f0] leading-snug">{tip.text}</p>
        </div>
      </div>
    </div>
  );
}

export default function CoachingPanel({ data }) {
  const tips = data?.coaching_tips || [];

  return (
    <div className="card flex flex-col justify-between p-4 h-full">
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-orbitron text-xs tracking-widest flex items-center gap-2"
            style={{ color: '#00d4ff', textShadow: '0 0 8px #00d4ff88' }}>
            <span>🧠</span>
            COACHING RECOMMENDATIONS
          </h3>
          {data && (
            <button
              onClick={() => {
                navigator.clipboard.writeText(JSON.stringify(data, null, 2));
              }}
              className="text-[10px] text-[#64748b] hover:text-[#00d4ff] transition-colors px-2 py-0.5 rounded border border-[#1e1e2e] hover:border-[#00d4ff44]"
              title="Copy results as JSON"
            >
              COPY JSON
            </button>
          )}
        </div>
        
        {tips.length > 0 ? (
          <div className="space-y-1.5 max-h-[200px] overflow-y-auto pr-1 custom-scrollbar">
            {tips.map((tip, i) => (
              <TipCard key={i} tip={tip} index={i} />
            ))}
          </div>
        ) : (
          <div className="py-8 flex flex-col items-center justify-center text-center">
            <div className="text-3xl mb-2">🎮</div>
            <p className="font-orbitron text-[10px] text-[#64748b] tracking-widest">AWAITING ANALYSIS</p>
          </div>
        )}
      </div>
    </div>
  );
}
