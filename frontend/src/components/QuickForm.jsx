import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Clock, Flame, Moon, Smile, User, Zap } from 'lucide-react';
import { api } from '../api';
import {
  DEFAULT_VALUES, DERIVED_FROM, INPUTS, INPUT_ENDS, TYPICAL_KEYS,
  deriveValues, formatValue, statusOf,
} from '../constants';

// Six questions. The other eight inputs are estimated from them or left typical.
const GROUPS = [
  { title: 'Play', items: [
    { id: 'daily_gaming_hours', icon: Clock, q: 'How many hours do you play a day?' },
    { id: 'night_gaming_ratio', icon: Moon, q: 'How often do your games start after 10 PM?' },
  ] },
  { title: 'Feelings', items: [
    { id: 'stress_level', icon: Zap, q: 'How stressed are you?' },
    { id: 'aggression_score', icon: Flame, q: 'How angry do you get after a loss?' },
    { id: 'happiness_score', icon: Smile, q: 'How happy have you felt lately?' },
  ] },
  { title: 'People', items: [
    { id: 'loneliness_score', icon: User, q: 'How lonely do you feel?' },
  ] },
];
const ASKED = GROUPS.flatMap((g) => g.items.map((i) => i.id));
const STATUS_WORD = { healthy: 'Healthy', watch: 'A bit off', risk: 'Far off' };
const toneOf = (level) => ({ low: 'ok', medium: 'watch', high: 'risk' }[String(level).toLowerCase()]);
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();

function Question({ item, value, touched, onChange }) {
  const index = ASKED.indexOf(item.id);
  const cfg = INPUTS[item.id];
  const Icon = item.icon;
  const status = statusOf(cfg, value);
  const pct = (v) => ((v - cfg.min) / (cfg.max - cfg.min)) * 100;
  const [lo, hi] = cfg.healthy;
  const [endLo, endHi] = INPUT_ENDS[item.id];
  const tone = !touched ? 'typ' : status === 'healthy' ? 'ok' : status;
  return (
    <div className="qf-q" style={{ '--i': index }}>
      <div className="qf-head">
        <span className="qf-ico"><Icon size={20} aria-hidden /></span>
        <label className="qf-text" htmlFor={`qf-${item.id}`}>{item.q}</label>
        <span className={`qf-val is-${tone}`} aria-live="polite">
          <b className="num">{formatValue(item.id, value)}{cfg.unit === '/10' && <small>/10</small>}</b>
          <small>{touched ? STATUS_WORD[status] : 'Typical, not set'}</small>
        </span>
      </div>
      <div className="qf-track">
        <span className="qf-zone" data-tip="The healthy range" style={{ left: `${pct(lo)}%`, width: `${pct(hi) - pct(lo)}%` }}><em>healthy</em></span>
        <input
          id={`qf-${item.id}`}
          type="range"
          className={touched ? '' : 'is-untouched'}
          min={cfg.min}
          max={cfg.max}
          step={cfg.step}
          value={value}
          onChange={(e) => onChange(item.id, parseFloat(e.target.value))}
        />
      </div>
      <div className="qf-ends" aria-hidden><span>{endLo}</span><span>{endHi}</span></div>
    </div>
  );
}

export default function QuickForm({ onDone, onBack }) {
  const [answers, setAnswers] = useState(() => Object.fromEntries(ASKED.map((k) => [k, DEFAULT_VALUES[k]])));
  const [touched, setTouched] = useState({});
  const [result, setResult] = useState(null);

  const derived = useMemo(() => deriveValues(answers), [answers]);

  // The result box is the real model, run on the answers so far.
  useEffect(() => {
    const ctrl = new AbortController();
    const t = setTimeout(() => {
      api.predict(derived, ctrl.signal).then(setResult).catch(() => {});
    }, 200);
    return () => { clearTimeout(t); ctrl.abort(); };
  }, [derived]);

  const change = (id, v) => {
    setAnswers((a) => ({ ...a, [id]: v }));
    setTouched((t) => ({ ...t, [id]: true }));
  };

  const finish = () => {
    const tags = {};
    Object.keys(DERIVED_FROM).forEach((k) => { tags[k] = 'Estimated'; });
    TYPICAL_KEYS.forEach((k) => { tags[k] = 'Typical'; });
    onDone(derived, tags);
  };

  return (
    <section className="qf" aria-labelledby="qf-title">
      <div className="qf-main plate">
        <button type="button" className="btn-quiet qf-back" onClick={onBack} data-tip="Go back and search for a player"><ArrowLeft size={15} aria-hidden /> Pick a player instead</button>
        <h2 id="qf-title" className="qf-title">Tell us about a normal week</h2>
        <p className="qf-sub">Move each slider to where you are. Leave any you are unsure about.</p>

        {GROUPS.map((g) => (
          <div key={g.title}>
            <h3 className="qf-group">{g.title}</h3>
            {g.items.map((item) => (
              <Question key={item.id} item={item} value={answers[item.id]} touched={!!touched[item.id]} onChange={change} />
            ))}
          </div>
        ))}

        <details className="qf-more">
          <summary>See the other {Object.keys(DERIVED_FROM).length + TYPICAL_KEYS.length} inputs <span>worked out from your answers</span></summary>
          <ul>
            {Object.entries(DERIVED_FROM).map(([k, from]) => (
              <li key={k}>
                <span>{INPUTS[k].label}<em>from {from}</em></span>
                <b className="num">{formatValue(k, derived[k])}</b>
                <i className="est">Estimated</i>
              </li>
            ))}
            {TYPICAL_KEYS.map((k) => (
              <li key={k}>
                <span>{INPUTS[k].label}<em>no question needed</em></span>
                <b className="num">{formatValue(k, derived[k])}</b>
                <i className="est is-typical">Typical</i>
              </li>
            ))}
          </ul>
          <p className="qf-note">Estimates, not measurements. You can change any of them on the report page.</p>
        </details>

        <div className="qf-nav">
          <span>Takes about a minute.</span>
          <button type="button" className="qf-go" onClick={finish} data-tip="Run the full analysis with your answers">See my report</button>
        </div>
      </div>

      <aside className="qf-live" aria-label="Your result so far">
        <h3><span className="qf-pulse" aria-hidden />Your result so far</h3>
        {result ? (
          <>
            <span key={`a${Math.round(result.rage_probability * 100)}`} className={`live-chip is-pulse tone-${toneOf(result.rage_risk_level)}`}>
              <small>Anger risk</small>
              <b className="num">{Math.round(result.rage_probability * 100)}% <em>{cap(result.rage_risk_level)}</em></b>
            </span>
            <span key={`b${result.addiction_category}`} className={`live-chip is-pulse tone-${toneOf(result.addiction_category)}`}>
              <small>Gaming addiction</small>
              <b>{result.addiction_category}</b>
            </span>
          </>
        ) : <span className="qf-wait">Running the model…</span>}
        <p>Moves as you move the sliders.</p>
      </aside>
    </section>
  );
}
