import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const STATUS_TEXT = { healthy: 'Healthy', watch: 'Watch', risk: 'Off track' };

// Head-to-head: the healthy limit and the player's value as two bars on one shared scale.
// Overshoot (too high) or shortfall (too low) is drawn in the status colour.
function HeadToHead({ d }) {
  const [min, max] = d.scale;
  const pct = (v) => Math.min(100, Math.max(0, ((v - min) / (max - min)) * 100));
  const [lo, hi] = d.healthy_range;
  const limit = d.worse === 'high' ? hi : lo;
  const you = d.value;
  const base = d.worse === 'high' ? Math.min(you, limit) : you;
  const gapFrom = d.worse === 'high' ? limit : you;
  const gapTo = d.worse === 'high' ? you : limit;
  const off = d.worse === 'high' ? you > limit : you < limit;
  return (
    <div className="h2h" aria-hidden>
      <span className="h2h-row">
        <span className="h2h-who">Healthy</span>
        <span className="h2h-lane"><span className="h2h-healthy" style={{ width: `${pct(limit)}%` }} /></span>
      </span>
      <span className="h2h-row">
        <span className="h2h-who">You</span>
        <span className="h2h-lane">
          <span className="h2h-you" style={{ width: `${pct(base)}%` }} />
          {off && (
            <span
              className={`h2h-gap status-${d.status} ${d.worse === 'low' ? 'is-short' : ''}`}
              style={{ left: `${pct(gapFrom)}%`, width: `${pct(gapTo) - pct(gapFrom)}%` }}
            />
          )}
        </span>
      </span>
    </div>
  );
}

function ImpactBar({ value, max, side }) {
  const w = Math.min(100, (Math.abs(value) / max) * 100);
  const kind = value >= 1 ? 'push' : value <= -1 ? 'protect' : 'flat';
  const num = <span className={`ib-num num ib-num-${kind}`}>{value >= 0.5 ? '+' : ''}{value.toFixed(0)}</span>;
  return (
    <>
      {side === 'l' && num}
      <span className={`ib ib-${side}`}>
        <span className={`ib-fill ib-${kind}`} style={{ width: `${w}%` }} />
      </span>
      {side === 'r' && num}
    </>
  );
}

function FactorRow({ d, max, open, onToggle, index }) {
  return (
    <li className={`factor ${open ? 'is-open' : ''}`} style={{ '--i': index }}>
      <button type="button" className="factor-row" aria-expanded={open} onClick={onToggle}>
        <span className="factor-name">
          <span className="factor-label">{d.label}</span>
          <span className="factor-value">
            <b className="num">{d.display_value}</b>
            <span className={`chip status-${d.status}`}>{STATUS_TEXT[d.status]}</span>
          </span>
        </span>
        <span className="factor-you">
          <HeadToHead d={d} />
          <span className="factor-goal">Healthy {d.healthy_label}</span>
        </span>
        <span className="factor-vs" aria-label={`Adds ${d.tilt_impact} points to tilt risk and ${d.addiction_impact} points to addiction`}>
          <ImpactBar value={d.tilt_impact} max={max} side="l" />
          <span className="vs-axis" />
          <ImpactBar value={d.addiction_impact} max={max} side="r" />
        </span>
        <ChevronDown size={18} className="factor-chev" aria-hidden />
      </button>
      {open && (
        <div className="factor-detail">
          <div className="factor-detail-inner">
            <p>{d.why}</p>
            <h4>How to fix it</h4>
            <ol>
              {d.steps.map((s, i) => <li key={i}>{s}</li>)}
            </ol>
          </div>
        </div>
      )}
    </li>
  );
}

export default function FactorBoard({ drivers }) {
  const [showAll, setShowAll] = useState(false);
  const [openKey, setOpenKey] = useState(() => {
    const top = drivers.find((d) => d.status !== 'healthy' && Math.max(d.tilt_impact, d.addiction_impact) >= 2);
    return top?.feature ?? null;
  });
  const max = Math.max(10, ...drivers.flatMap((d) => [Math.abs(d.tilt_impact), Math.abs(d.addiction_impact)]));
  const relevant = drivers.filter((d) => d.status !== 'healthy' || Math.max(Math.abs(d.tilt_impact), Math.abs(d.addiction_impact)) >= 2);
  const shown = showAll || relevant.length === 0 ? drivers : relevant;

  return (
    <section className="plate factors" aria-labelledby="factors-title">
      <header className="section-head">
        <h2 id="factors-title">What's driving your score</h2>
        <p>
          Each factor is shown against its healthy range. The bars on the right show how many points it adds to tilt
          risk and to addiction, from the model, compared with a healthy baseline. Open a factor for what to do about it.
        </p>
      </header>

      <div className="factors-cols" aria-hidden>
        <span>Factor</span>
        <span>You vs healthy</span>
        <span className="factors-vs-head"><b>Tilt</b><b>Addiction</b></span>
        <span />
      </div>

      <ul className="factor-list">
        {shown.map((d, i) => (
          <FactorRow
            key={d.feature}
            index={i}
            d={d}
            max={max}
            open={openKey === d.feature}
            onToggle={() => setOpenKey(openKey === d.feature ? null : d.feature)}
          />
        ))}
      </ul>

      {relevant.length > 0 && relevant.length < drivers.length && (
        <button type="button" className="btn-quiet factors-more" onClick={() => setShowAll(!showAll)}>
          {showAll ? 'Show only the factors that matter' : `Show all ${drivers.length} factors (${drivers.length - relevant.length} already healthy)`}
        </button>
      )}
    </section>
  );
}
