import { RotateCcw } from 'lucide-react';
import { INPUTS, INPUT_GROUPS, formatValue } from '../constants';

function statusOf(cfg, v) {
  if (!cfg.healthy) return 'neutral';
  const [lo, hi] = cfg.healthy;
  if (v >= lo && v <= hi) return 'healthy';
  const gap = v > hi ? v - hi : lo - v;
  return gap <= 0.15 * (cfg.max - cfg.min) ? 'watch' : 'risk';
}

function Slider({ id, value, onChange }) {
  const cfg = INPUTS[id];
  const pct = (v) => ((v - cfg.min) / (cfg.max - cfg.min)) * 100;
  const status = statusOf(cfg, value);
  const [lo, hi] = cfg.healthy || [0, 0];
  return (
    <div className={`slider is-${status}`}>
      <div className="slider-top">
        <label htmlFor={`in-${id}`}>{cfg.label}</label>
        <output htmlFor={`in-${id}`} className="num">{formatValue(id, value)}{cfg.unit === '/10' && <small>/10</small>}</output>
      </div>
      <div className="slider-track" style={{ '--fill': `${pct(value)}%` }}>
        {cfg.healthy && (
          <span
            className="slider-healthy"
            style={{ left: `${pct(Math.max(lo, cfg.min))}%`, width: `${pct(Math.min(hi, cfg.max)) - pct(Math.max(lo, cfg.min))}%` }}
            aria-hidden
          />
        )}
        <input
          id={`in-${id}`}
          type="range"
          min={cfg.min}
          max={cfg.max}
          step={cfg.step}
          value={value}
          aria-describedby={`hint-${id}`}
          onChange={(e) => onChange(id, parseFloat(e.target.value))}
        />
      </div>
      <p className="slider-hint" id={`hint-${id}`}>{cfg.hint}</p>
    </div>
  );
}

export default function InputsPanel({ values, onChange, onReset, dirty, hasPlayer }) {
  return (
    <section className="plate inputs" aria-labelledby="inputs-title">
      <header className="inputs-head">
        <h2 id="inputs-title">{hasPlayer ? 'Behaviour & check-in' : 'Enter your numbers'}</h2>
        {dirty && (
          <button type="button" className="btn-quiet" onClick={onReset}>
            <RotateCcw size={14} aria-hidden /> {hasPlayer ? 'Reset to profile' : 'Reset'}
          </button>
        )}
      </header>
      <p className="inputs-legend">
        <span className="legend-swatch" aria-hidden /> Healthy range. Drag any slider and the report updates live.
      </p>
      {INPUT_GROUPS.map((g) => (
        <fieldset key={g.id} className="inputs-group">
          <legend>
            <span>{g.id === 'match' && !hasPlayer ? 'Play time' : g.title}</span>
            <small>{hasPlayer ? g.note : 'Self-reported'}</small>
          </legend>
          {g.keys.map((k) => (
            <Slider key={k} id={k} value={values[k]} onChange={onChange} />
          ))}
        </fieldset>
      ))}
    </section>
  );
}
