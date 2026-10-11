import { useCountUp, useReveal } from '../../motion';

const tone = (cat) => ({ Low: 'ok', Medium: 'watch', High: 'risk' }[cat]);
const tiltTone = (p) => (p < 0.4 ? 'ok' : p < 0.7 ? 'watch' : 'risk');

function Side({ title, tilt, index, category, side, active }) {
  const lag = side === 'after' ? 650 : 250;
  const tiltShown = useCountUp(Math.round(tilt * 100), { delay: lag, active });
  const indexShown = useCountUp(Math.round(index), { delay: lag + 100, active });
  return (
    <div className={`mu-side mu-${side}`}>
      <h3>{title}</h3>
      <dl>
        <div className={`tone-${tiltTone(tilt)}`}>
          <dt>Tilt risk</dt>
          <dd className="num">{tiltShown}%</dd>
        </div>
        <div className={`tone-${tone(category)}`}>
          <dt>Addiction · {category}</dt>
          <dd className="num">{indexShown}<small>/100</small></dd>
        </div>
      </dl>
    </div>
  );
}

export default function Matchup({ data }) {
  const p = data.report.projected;
  const [ref, inView] = useReveal();
  if (!p.changes.length) return null;
  return (
    <section className="plate matchup" aria-labelledby="mu-title" ref={ref}>
      <header className="section-head">
        <h2 id="mu-title">If you follow the plan</h2>
        <p>
          The same models, re-run with only your habits changed to the plan's targets. Mood and stress are left
          as they are, so this is a conservative estimate.
        </p>
      </header>
      <div className="mu-board">
        <Side active={inView} side="now" title="Now" tilt={data.rage_probability} index={data.addiction_index} category={data.addiction_category} />
        <span className="mu-divider" aria-hidden><b>VS</b></span>
        <Side active={inView} side="after" title="After plan" tilt={p.tilt_probability} index={p.addiction_index} category={p.addiction_category} />
      </div>
      <ul className="mu-changes">
        {p.changes.map((c) => (
          <li key={c.feature}>
            <span>{c.label}</span>
            <span className="num"><s>{c.from}</s> → <b>{c.to}</b></span>
          </li>
        ))}
      </ul>
    </section>
  );
}
