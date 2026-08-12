import React, { useMemo, useState } from 'react';

const SEVERITY_COLORS = {
  high: { border: '#ff2d55', text: '#ff2d55', tagBg: '#ff2d5522', label: 'CRITICAL' },
  medium: { border: '#fbbf24', text: '#fbbf24', tagBg: '#fbbf2422', label: 'MODERATE' },
  low: { border: '#00ff88', text: '#00ff88', tagBg: '#00ff8822', label: 'HEALTHY' },
};

export default function ExplainableAIPanel({ prediction, inputValues }) {
  const [showFullTechDetails, setShowFullTechDetails] = useState(false);

  const insights = useMemo(() => {
    if (!prediction || !inputValues) return null;

    const drivers = [];
    const { 
      stress_level, 
      sleep_hours, 
      toxic_exposure, 
      daily_gaming_hours, 
      night_gaming_ratio, 
      anxiety_score,
    } = inputValues;

    // 1. Sleep Deprivation Driver
    if (sleep_hours < 6) {
      drivers.push({
        feature: 'Sleep Deprivation',
        value: `${sleep_hours} hrs/night`,
        severity: sleep_hours < 5 ? 'high' : 'medium',
        impact: `+${Math.round((6 - sleep_hours) * 18)}% Tilt Risk`,
        explanation: `Sleeping under 6 hours elevates baseline nervous tension, multiplying tilt susceptibility by 2.4x.`,
        actionTip: `Target 7.5+ hours. Turn off screens 30 mins before sleep to lower initial tilt risk.`,
        icon: '🌙'
      });
    }

    // 2. High Stress & Anxiety Pair Driver
    if (stress_level >= 7 || anxiety_score >= 6) {
      drivers.push({
        feature: 'Elevated Baseline Cortisol (Stress)',
        value: `Stress: ${stress_level}/10`,
        severity: stress_level >= 8 ? 'high' : 'medium',
        impact: `+${Math.round(stress_level * 6.5)}% Neural Risk`,
        explanation: `High baseline stress puts you in a hyper-reactive state where match setbacks feel frustrating.`,
        actionTip: `Do 3 cycles of 4-7-8 tactical breathing between rounds to lower your heart rate.`,
        icon: '🧠'
      });
    }

    // 3. Toxic Exposure & Night Gaming Compound Driver
    if (toxic_exposure >= 0.5 || night_gaming_ratio >= 0.6) {
      drivers.push({
        feature: 'Late-Night & Toxic Lobbies',
        value: `Toxicity: ${Math.round(toxic_exposure * 100)}%`,
        severity: (toxic_exposure >= 0.7 && night_gaming_ratio >= 0.7) ? 'high' : 'medium',
        impact: `+${Math.round(toxic_exposure * 30 + night_gaming_ratio * 20)}% Multiplier`,
        explanation: `Late gaming in aggressive lobbies exhausts dopamine, causing immediate rage-quits.`,
        actionTip: `Mute voice/text chat instantly upon entry and stop ranked matches after 10 PM.`,
        icon: '⚠️'
      });
    }

    // 4. Over-Gaming & Session Length
    if (daily_gaming_hours >= 7) {
      drivers.push({
        feature: 'Marathon Session Fatigue',
        value: `${daily_gaming_hours} hrs daily`,
        severity: daily_gaming_hours >= 10 ? 'high' : 'medium',
        impact: `Addiction Driver (${prediction.addiction_category})`,
        explanation: `Sessions over 7 hours daily degrade motor reaction times and cause emotional fatigue.`,
        actionTip: `Take a mandatory 15-minute physical break after every 90 minutes of gameplay.`,
        icon: '⏱️'
      });
    }

    // 5. Positive / Protective Driver
    if (drivers.length === 0 || prediction.rage_risk_level === 'LOW') {
      drivers.push({
        feature: 'Optimal Recovery & Mood Balance',
        value: `Sleep: ${sleep_hours}h | Stress: ${stress_level}/10`,
        severity: 'low',
        impact: 'Protective (-35% Risk)',
        explanation: `Good sleep and low toxicity keep cognitive resilience strong during intense matches.`,
        actionTip: `Keep this session structure to preserve peak focus and competitive winrates!`,
        icon: '🛡️'
      });
    }

    return drivers;
  }, [prediction, inputValues]);

  return (
    <div className="card relative overflow-hidden p-3.5 sm:p-4">
      {/* Title Header */}
      <div className="flex items-center justify-between mb-2.5 border-b border-[#1e1e2e] pb-2">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-3.5 bg-gradient-to-b from-[#00d4ff] to-[#7c3aed] rounded-full" />
          <h3 className="font-orbitron text-xs tracking-wider text-[#00d4ff] flex items-center gap-1.5"
              style={{ textShadow: '0 0 8px #00d4ff44' }}>
            <span>⚡ EXPLAINABLE AI DRIVERS</span>
          </h3>
        </div>
        <button
          onClick={() => setShowFullTechDetails(!showFullTechDetails)}
          className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#1e1e2e] hover:bg-[#334155]/40 text-[#00d4ff] border border-[#00d4ff]/30 transition-colors"
        >
          {showFullTechDetails ? 'HIDE DETAILS' : 'EXPAND AI ATTRIBUTION ▼'}
        </button>
      </div>

      {prediction && insights ? (
        <div className="space-y-2.5">
          {/* Executive AI Summary Line */}
          <div className="p-2.5 rounded-lg bg-[#0a0a0f] border border-[#1e1e2e] flex items-center justify-between gap-2">
            <p className="text-xs text-[#e2e8f0] leading-tight">
              AI calculated <strong className="text-[#00ff88]">{Math.round(prediction.rage_probability * 100)}% Tilt Risk</strong> ({prediction.rage_risk_level}) & <strong className="text-[#00d4ff]">{prediction.addiction_category} Addiction Level</strong>.
            </p>
            <div className="px-2 py-1 rounded bg-[#12121a] border border-[#334155] shrink-0 text-right">
              <span className="text-[9px] text-[#64748b] block font-mono">TOP IMPACT</span>
              <span className="text-[11px] font-orbitron font-bold text-[#ff2d55]">
                {insights[0]?.feature.split(' ')[0]}
              </span>
            </div>
          </div>

          {/* Compact Feature Drivers List (Top 2 shown by default, full list on expand) */}
          <div className="space-y-2">
            {(showFullTechDetails ? insights : insights.slice(0, 2)).map((driver, idx) => {
              const theme = SEVERITY_COLORS[driver.severity] || SEVERITY_COLORS.medium;
              return (
                <div
                  key={idx}
                  className="rounded-lg p-2.5 transition-all duration-200 border bg-[#12121a]"
                  style={{
                    borderColor: '#1e1e2e',
                    borderLeft: `3px solid ${theme.border}`,
                  }}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{driver.icon}</span>
                      <h4 className="text-xs font-rajdhani font-bold text-[#e2e8f0]">
                        {driver.feature}
                      </h4>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded text-[#94a3b8] bg-[#1e1e2e]">
                        {driver.value}
                      </span>
                      <span
                        className="text-[9px] font-orbitron font-bold px-1.5 py-0.2 rounded"
                        style={{ color: theme.text, background: theme.tagBg }}
                      >
                        {driver.impact}
                      </span>
                    </div>
                  </div>

                  {showFullTechDetails && (
                    <p className="text-[11px] text-[#94a3b8] leading-normal mb-1.5 pl-6 font-sans">
                      {driver.explanation}
                    </p>
                  )}

                  {/* Clean Actionable Line */}
                  <div className="pl-2 border-l border-[#00ff88]/40 flex items-center gap-1.5 mt-1">
                    <span className="text-xs text-[#00ff88]">💡</span>
                    <p className="text-[11px] text-[#00ff88] font-mono font-medium">
                      <strong className="text-white">Action: </strong>{driver.actionTip}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="py-4 flex flex-col items-center justify-center text-center">
          <span className="font-orbitron text-[10px] text-[#64748b] tracking-widest uppercase">
            AWAITING EXPLAINABLE AI DIAGNOSTICS
          </span>
        </div>
      )}
    </div>
  );
}
