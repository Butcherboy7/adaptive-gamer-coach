import { useCountUp } from '../../motion';

const LEVEL_TEXT = {
  LOW: 'Low risk. Losses rarely push you into rage-quitting.',
  MEDIUM: 'Medium risk. Bad streaks can tip you into tilt.',
  HIGH: 'High risk. You are likely to tilt or rage-quit after setbacks.',
};

const ADDICTION_TEXT = {
  Low: 'Gaming fits around the rest of your life.',
  Medium: 'Gaming is starting to crowd out sleep, people or other plans.',
  High: 'Gaming is taking priority over sleep, people and responsibilities.',
};

const tone = (level) => ({ LOW: 'ok', MEDIUM: 'watch', HIGH: 'risk', Low: 'ok', Medium: 'watch', High: 'risk' }[level]);

function SteppedMeter({ value, marks, label }) {
  // 20 fixed steps: risk is read off a stepped ramp, never a free gradient.
  const steps = 20;
  const lit = Math.round(value * steps);
  return (
    <div className="meter" role="meter" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(value * 100)} aria-label={label}>
      <div className="meter-steps">
        {Array.from({ length: steps }).map((_, i) => {
          const at = (i + 0.5) / steps;
          const band = marks ? (at < marks[0] ? 'ok' : at < marks[1] ? 'watch' : 'risk') : 'ok';
          return <span key={i} className={`meter-step band-${band} ${i < lit ? 'is-lit' : ''}`} style={{ '--i': i }} />;
        })}
      </div>
      {marks && (
        <div className="meter-marks" aria-hidden>
          <span style={{ left: `${marks[0] * 100}%` }}>{marks[0] * 100}</span>
          <span style={{ left: `${marks[1] * 100}%` }}>{marks[1] * 100}</span>
        </div>
      )}
    </div>
  );
}

export default function Scores({ data, enter = 0 }) {
  const startMs = enter * 1000 + 260;
  const tiltPct = useCountUp(Math.round(data.rage_probability * 100), { delay: startMs });
  const addIdx = useCountUp(Math.round(data.addiction_index), { delay: startMs + 120 });
  const probs = data.addiction_probabilities;
  const cats = ['Low', 'Medium', 'High'];
  return (
    <div className="scores">
      <section className={`plate score tone-${tone(data.rage_risk_level)}`} aria-labelledby="tilt-title">
        <h3 id="tilt-title" className="score-title">Tilt / rage-quit risk</h3>
        <div className="score-figure">
          <span className="score-value num">{tiltPct}<small>%</small></span>
          <span className="score-level">{data.rage_risk_level}</span>
        </div>
        <SteppedMeter value={data.rage_probability} marks={[0.4, 0.7]} label="Tilt risk" />
        <p className="score-text">{LEVEL_TEXT[data.rage_risk_level]}</p>
      </section>

      <section className={`plate score tone-${tone(data.addiction_category)}`} aria-labelledby="add-title">
        <h3 id="add-title" className="score-title">Gaming addiction level</h3>
        <div className="score-figure">
          <span className="score-value num">{addIdx}<small>/100</small></span>
          <span className="score-level">{data.addiction_category.toUpperCase()}</span>
        </div>
        <div className="split" aria-label="Model confidence per level">
          <div className="split-bar">
            {cats.map((c) => (
              <span key={c} className={`split-seg seg-${tone(c)}`} style={{ flexGrow: Math.max(probs[c] || 0, 0.0001), '--i': cats.indexOf(c) }} />
            ))}
          </div>
          <div className="split-legend">
            {cats.map((c) => (
              <span key={c} className={c === data.addiction_category ? 'is-current' : ''}>
                <i className={`seg-${tone(c)}`} />{c} <b className="num">{Math.round((probs[c] || 0) * 100)}%</b>
              </span>
            ))}
          </div>
        </div>
        <p className="score-text">{ADDICTION_TEXT[data.addiction_category]}</p>
      </section>
    </div>
  );
}
