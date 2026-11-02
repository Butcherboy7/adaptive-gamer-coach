import { AlertTriangle, Check, Gamepad2, Moon, RotateCcw, Smile, Users } from 'lucide-react';
import { INPUTS, INPUT_ENDS, formatValue, statusOf } from '../constants';
import { FACTOR_ICONS } from './factorIcons';

const GROUPS = [
  { id: 'match', title: 'Play', icon: Gamepad2, keys: ['daily_gaming_hours', 'weekly_sessions', 'night_gaming_ratio'] },
  { id: 'habits', title: 'Habits', icon: Moon, keys: ['sleep_hours', 'toxic_exposure', 'microtransactions_spending', 'years_gaming'] },
  { id: 'mind', title: 'Mood', icon: Smile, keys: ['stress_level', 'anxiety_score', 'aggression_score', 'depression_score', 'happiness_score'] },
  { id: 'social', title: 'Social', icon: Users, keys: ['loneliness_score', 'social_interaction_score'] },
];

const toneOf = (level) => ({ low: 'ok', medium: 'watch', high: 'risk' }[String(level).toLowerCase()]);
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();

// Always-visible result: drag any slider below and these two move with it.
function LiveResult({ result, busy }) {
  if (!result) return null;
  const tilt = Math.round(result.rage_probability * 100);
  const add = result.addiction_category;
  return (
    <div className={`live ${busy ? 'is-busy' : ''}`} role="status" aria-label="Live result">
      <span className={`live-chip tone-${toneOf(result.rage_risk_level)}`}>
        <small>Anger risk</small>
        <b className="num">{tilt}% <em>{cap(result.rage_risk_level)}</em></b>
      </span>
      <span className={`live-chip tone-${toneOf(add)}`}>
        <small>Addiction</small>
        <b>{add}</b>
      </span>
    </div>
  );
}

function Slider({ id, value, onChange, tag }) {
  const cfg = INPUTS[id];
  const Icon = FACTOR_ICONS[id];
  const pct = (v) => ((v - cfg.min) / (cfg.max - cfg.min)) * 100;
  const status = statusOf(cfg, value);
  const [lo, hi] = cfg.healthy || [0, 0];
  const [endLo, endHi] = INPUT_ENDS[id];
  return (
    <div className={`slider is-${status}`}>
      <div className="slider-top">
        <label htmlFor={`in-${id}`} title={cfg.hint}>
          {Icon && <Icon size={16} className="slider-icon" aria-hidden />}
          {cfg.label}
          {tag && <i className={`est ${tag === 'Typical' ? 'is-typical' : ''}`}>{tag}</i>}
        </label>
        <output htmlFor={`in-${id}`} className="num">
          {formatValue(id, value)}{cfg.unit === '/10' && <small>/10</small>}
          {status === 'healthy' && <Check size={14} className="slider-state" aria-label="Healthy" />}
          {(status === 'watch' || status === 'risk') && <AlertTriangle size={14} className="slider-state" aria-label={status === 'risk' ? 'Far from healthy' : 'Close to healthy range'} />}
        </output>
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
          aria-label={`${cfg.label}. ${cfg.hint}`}
          onChange={(e) => onChange(id, parseFloat(e.target.value))}
        />
      </div>
      <div className="slider-ends" aria-hidden><span>{endLo}</span><span>{endHi}</span></div>
    </div>
  );
}

export default function InputsPanel({ values, onChange, onReset, dirty, hasPlayer, result, busy, tags = {} }) {
  return (
    <section className="plate inputs" aria-labelledby="inputs-title">
      <LiveResult result={result} busy={busy} />
      <header className="inputs-head">
        <h2 id="inputs-title">{hasPlayer ? 'Try changing a habit' : 'Your numbers'}</h2>
        {dirty && (
          <button type="button" className="btn-quiet" onClick={onReset}>
            <RotateCcw size={14} aria-hidden /> Reset
          </button>
        )}
      </header>
      <p className="inputs-legend" aria-hidden>
        <span className="legend-swatch" /> Healthy zone
      </p>
      {GROUPS.map((g) => {
        const GIcon = g.icon;
        return (
          <fieldset key={g.id} className="inputs-group">
            <legend><GIcon size={16} aria-hidden /> <span>{g.title}</span></legend>
            {g.keys.map((k) => <Slider key={k} id={k} value={values[k]} onChange={onChange} tag={tags[k]} />)}
          </fieldset>
        );
      })}
    </section>
  );
}
