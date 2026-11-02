import { useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';
import { FACTOR_ICONS } from '../factorIcons';

const STATUS_WORD = { healthy: 'Healthy', watch: 'Watch', risk: 'Too far off' };

// One scale: the green zone is healthy, the dot is you. Sitting outside the zone is the problem.
function Scale({ d }) {
  const [min, max] = d.scale;
  const pct = (v) => Math.min(100, Math.max(0, ((v - min) / (max - min)) * 100));
  const [lo, hi] = d.healthy_range;
  return (
    <div className="scale" aria-hidden>
      <span className="scale-zone" style={{ left: `${pct(lo)}%`, width: `${pct(hi) - pct(lo)}%` }} />
      <span className={`scale-pin status-${d.status}`} style={{ left: `${pct(d.value)}%` }} />
    </div>
  );
}

function Impact({ d, max }) {
  const tilt = Math.max(0, d.tilt_impact);
  const add = Math.max(0, d.addiction_impact);
  const top = Math.max(tilt, add);
  return (
    <span className="impact">
      <span className="impact-line">
        <span className="impact-track"><span className="impact-fill" style={{ width: `${Math.min(100, (top / max) * 100)}%` }} /></span>
        <b className="num">{top >= 0.5 ? `+${top.toFixed(0)}` : '0'}</b>
      </span>
      <span className="impact-tags">
        {tilt >= 2 && <i>Anger</i>}
        {add >= 2 && <i>Addiction</i>}
      </span>
    </span>
  );
}

function Row({ d, max, open, onToggle, index, extra }) {
  const Icon = FACTOR_ICONS[d.feature];
  return (
    <li className={`prob ${open ? 'is-open' : ''} ${extra ? 'is-extra' : ''}`} style={{ '--i': index }}>
      <button type="button" className="prob-row" aria-expanded={open} onClick={onToggle}>
        <span className="prob-name">
          <span className={`prob-ico status-${d.status}`}>{Icon && <Icon size={18} aria-hidden />}</span>
          <span>
            <b>{d.label}</b>
            <small className="num">{d.display_value} <em>· healthy {d.healthy_label}</em></small>
          </span>
        </span>
        <Scale d={d} />
        <Impact d={d} max={max} />
        <ChevronDown size={18} className="prob-chev" aria-hidden />
      </button>
      {open && (
        <div className="prob-detail">
          <p>{d.why}</p>
          <ol>{d.steps.map((s, i) => <li key={i}>{s}</li>)}</ol>
        </div>
      )}
    </li>
  );
}

export default function Problems({ drivers }) {
  const impact = (d) => Math.max(d.tilt_impact, d.addiction_impact, 0);
  const problems = drivers
    .filter((d) => d.status !== 'healthy' || impact(d) >= 2)
    .sort((a, b) => impact(b) - impact(a));
  const healthy = drivers.filter((d) => !problems.includes(d));
  const max = Math.max(10, ...problems.map(impact));
  const [openKey, setOpenKey] = useState(null);
  const [showAll, setShowAll] = useState(false);
  const TOP = 5;
  const shown = showAll ? problems : problems.slice(0, TOP);
  const hidden = problems.length - shown.length;

  return (
    <section className="plate problems" aria-labelledby="problems-title">
      <header className="section-head">
        <h2 id="problems-title">What's pushing your risk up</h2>
        <p className="prob-legend" aria-hidden>
          <span><i className="lg-zone" /> Healthy zone</span>
          <span><i className="lg-pin" /> You</span>
          <span>Longer bar = bigger effect</span>
        </p>
      </header>

      {problems.length === 0 ? (
        <p className="prob-none"><Check size={18} aria-hidden /> Nothing is pushing your risk up. Keep it steady.</p>
      ) : (
        <ul className="prob-list">
          {shown.map((d, i) => (
            <Row key={d.feature} index={i} extra={i >= TOP} d={d} max={max} open={openKey === d.feature} onToggle={() => setOpenKey(openKey === d.feature ? null : d.feature)} />
          ))}
        </ul>
      )}

      {problems.length > TOP && (
        <button type="button" className="btn-quiet prob-more" onClick={() => setShowAll(!showAll)}>
          {showAll ? 'Show only the biggest 5' : `Show ${hidden} smaller effects`}
        </button>
      )}

      {healthy.length > 0 && problems.length > 0 && (
        <div className="prob-ok">
          <span className="prob-ok-title"><Check size={15} aria-hidden /> Healthy</span>
          <ul>
            {healthy.map((d) => {
              const Icon = FACTOR_ICONS[d.feature];
              return <li key={d.feature} title={`${d.label}: ${d.display_value}`}>{Icon && <Icon size={14} aria-hidden />}{d.label}</li>;
            })}
          </ul>
        </div>
      )}
    </section>
  );
}
