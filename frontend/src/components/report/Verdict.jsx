import { ArrowRight, MoveRight } from 'lucide-react';

const tiltTone = (p) => (p < 0.4 ? 'ok' : p < 0.7 ? 'watch' : 'risk');
const addTone = (c) => ({ Low: 'ok', Medium: 'watch', High: 'risk' }[c]);
const pct = (p) => Math.round(p * 100);
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();

function Line({ lane, children, note }) {
  return (
    <div className="vd-line">
      <dt>{lane}</dt>
      <dd className="vd-figure">{children}</dd>
      <dd className="vd-note">{note}</dd>
    </div>
  );
}

// The lower-third: a headline, one deck line, then three ruled data lines that carry
// the numbers (where you stand, what drives it, what the plan does) instead of a paragraph.
export default function Verdict({ data }) {
  const { summary, projected } = data.report;
  const drivers = summary.drivers || [];
  const tilt = data.rage_probability;
  const idx = Math.round(data.addiction_index);
  const cat = data.addiction_category;
  // Only show the before/after when the plan moves a score by a few points; otherwise it's noise.
  const changes = projected.changes.length > 0
    && (pct(tilt) - pct(projected.tilt_probability) >= 3 || idx - Math.round(projected.addiction_index) >= 3);

  return (
    <section className="verdict" aria-labelledby="verdict-title">
      <div className="verdict-plate">
        <h2 id="verdict-title" className="verdict-headline">{summary.headline}</h2>
        <p className="verdict-deck">{summary.deck}</p>

        <dl className="vd-lines">
          <Line lane="Now" note={`${cap(data.rage_risk_level)} tilt risk, ${cat.toLowerCase()} addiction level.`}>
            <span className={`vd-stat ink-${tiltTone(tilt)}`}>{pct(tilt)}<small>% tilt</small></span>
            <span className={`vd-stat ink-${addTone(cat)}`}>{idx}<small>/100 addiction</small></span>
          </Line>

          <Line
            lane="Driving it"
            note={drivers.length ? (drivers.length > 1 ? 'Fix these two first. They carry most of your risk.' : 'Fix this first. It carries most of your risk.') : 'No habit is pushing your risk up meaningfully.'}
          >
            {drivers.length ? drivers.map((d) => (
              <span key={d.feature} className="vd-driver">
                {d.label}<b className="num">+{d.points}</b>
              </span>
            )) : <span className="vd-word ink-ok">Nothing major</span>}
          </Line>

          <Line
            lane="With the plan"
            note={changes ? 'Same models, re-run on the plan’s targets.' : 'You’re already at or near every healthy target.'}
          >
            {changes ? (
              <>
                <span className="vd-shift">
                  <s className="num">{pct(tilt)}</s><MoveRight size={16} aria-label="to" />
                  <span className={`vd-stat ink-${tiltTone(projected.tilt_probability)}`}>{pct(projected.tilt_probability)}<small>% tilt</small></span>
                </span>
                <span className="vd-shift">
                  <s className="num">{idx}</s><MoveRight size={16} aria-label="to" />
                  <span className={`vd-stat ink-${addTone(projected.addiction_category)}`}>{Math.round(projected.addiction_index)}<small>/100</small></span>
                </span>
              </>
            ) : <span className="vd-word ink-ok">Hold steady</span>}
          </Line>
        </dl>
      </div>
      <div className="verdict-next">
        <ArrowRight size={22} aria-hidden className="verdict-next-icon" />
        <p>
          <strong>Do this first.</strong> {summary.next_action}
        </p>
      </div>
    </section>
  );
}
