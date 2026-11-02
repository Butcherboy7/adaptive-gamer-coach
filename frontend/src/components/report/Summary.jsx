import { ArrowRight, Flame, Gamepad2, Info } from 'lucide-react';
import { useCountUp } from '../../motion';

const LEVELS = ['Low', 'Medium', 'High'];
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
const tone = (level) => ({ low: 'ok', medium: 'watch', high: 'risk' }[level.toLowerCase()]);
const MARKS = [0.4, 0.7];

// Three zones with a solid pin for now and a hollow pin for where the plan would land.
function BandMeter({ value, after }) {
  const [lo, hi] = MARKS;
  const widths = [lo, hi - lo, 1 - hi];
  const at = (v) => `${Math.min(99, Math.max(1, v * 100))}%`;
  return (
    <div className="band-meter">
      <div className="band-track">
        <span className="band band-ok" style={{ width: `${widths[0] * 100}%`, '--i': 0 }} />
        <span className="band band-watch" style={{ width: `${widths[1] * 100}%`, '--i': 1 }} />
        <span className="band band-risk" style={{ width: `${widths[2] * 100}%`, '--i': 2 }} />
        {after != null && <span className="band-pin band-ghost" style={{ left: at(after) }} data-tip={`After the plan: about ${Math.round(after * 100)}%`} />}
        <span className="band-pin" style={{ left: at(value) }} data-tip={`Now: ${Math.round(value * 100)}%`} />
      </div>
      <div className="band-labels" aria-hidden>
        {LEVELS.map((n, i) => <span key={n} style={{ width: `${widths[i] * 100}%` }}>{n}</span>)}
      </div>
    </div>
  );
}

// Low / Medium / High as three blocks: the model's pick is solid, the plan's outcome is outlined.
function LevelBar({ current, after, probs }) {
  return (
    <div className="level-bar" role="img" aria-label={`Addiction level ${current}${after ? `, ${after} after the plan` : ''}`}>
      {LEVELS.map((l, i) => (
        <span key={l} style={{ '--i': i }} title={`${l}: the model gives ${Math.round((probs[l] || 0) * 100)}% chance${l === current ? ' (its pick)' : ''}`} className={`level level-${tone(l)} ${l === current ? 'is-now' : ''} ${l === after ? 'is-after' : ''}`}>
          <b>{l}</b>
          <small className="num">{Math.round((probs[l] || 0) * 100)}%</small>
        </span>
      ))}
    </div>
  );
}

function Legend({ afterLabel }) {
  return (
    <p className="legend-line">
      <span data-tip="Where you are today"><i className="mk mk-now" /> Now</span>
      <span data-tip="Where the model expects you to land if you follow the plan"><i className="mk mk-after" /> After plan <b className="num">{afterLabel}</b></span>
    </p>
  );
}

export default function Summary({ data }) {
  const { summary, projected } = data.report;
  const tiltPct = useCountUp(Math.round(data.rage_probability * 100), { delay: 700 });
  const projTilt = Math.round(projected.tilt_probability * 100);
  const tiltLevel = cap(data.rage_risk_level);
  const addLevel = data.addiction_category;

  const hasPlan = projected.changes.length > 0;
  const tiltAfter = hasPlan && Math.round(data.rage_probability * 100) - projTilt >= 3;
  const addAfter = hasPlan && LEVELS.indexOf(projected.addiction_category) < LEVELS.indexOf(addLevel);

  return (
    <section className="summary" aria-labelledby="summary-title">
      <div className="verdict">
        <header className="verdict-head">
          <h2 id="summary-title" className="summary-title">{summary.headline}</h2>
          <p className="summary-deck">{summary.deck}</p>
        </header>
        <div className="verdict-next">
          <ArrowRight size={20} aria-hidden className="verdict-next-icon" />
          <p><strong>Do this first:</strong> {summary.next_action}</p>
        </div>
      </div>

      <div className="scores">
        <section className={`plate score tone-${tone(tiltLevel)}`} aria-label="Anger risk">
          <h3 className="score-title">
            <Flame size={16} aria-hidden /> Anger risk
            <span className="score-info" tabIndex={0} role="img" aria-label="Chance you lose your temper and quit after a bad game" data-tip="Chance you lose your temper and quit after a bad game"><Info size={14} aria-hidden /></span>
          </h3>
          <div className="score-figure">
            <span className="score-value num">{tiltPct}<small>%</small></span>
            <span className="score-level">{tiltLevel}</span>
          </div>
          <BandMeter value={data.rage_probability} after={tiltAfter ? projected.tilt_probability : null} />
          {tiltAfter && <Legend afterLabel={`${projTilt}%`} />}
        </section>

        <section className={`plate score tone-${tone(addLevel)}`} aria-label="Gaming addiction level">
          <h3 className="score-title">
            <Gamepad2 size={16} aria-hidden /> Gaming addiction
            <span className="score-info" tabIndex={0} role="img" aria-label="How much gaming is crowding out sleep, people and other plans" data-tip="How much gaming is crowding out sleep, people and other plans"><Info size={14} aria-hidden /></span>
          </h3>
          <div className="score-figure">
            <span className="score-value score-word">{addLevel}</span>
          </div>
          <LevelBar current={addLevel} after={addAfter ? projected.addiction_category : null} probs={data.addiction_probabilities} />
          {addAfter && <Legend afterLabel={projected.addiction_category} />}
        </section>
      </div>
    </section>
  );
}
