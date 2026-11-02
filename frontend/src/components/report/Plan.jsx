import { CalendarCheck, ChevronDown, Sun, Target } from 'lucide-react';

const PHASE_ICON = [Sun, CalendarCheck, Target];

function Taper({ weeks }) {
  const budget = 3;
  const top = Math.ceil(Math.max(...weeks.map((w) => w.hours), budget + 1));
  const pct = (v) => `${(v / top) * 100}%`;
  return (
    <figure className="taper">
      <figcaption><b>Daily play cap</b> Step down each week to the 3h budget</figcaption>
      <div className="taper-plot" role="img" aria-label={`Daily cap by week: ${weeks.map((w) => `${w.label} ${w.hours} hours`).join(', ')}. Budget 3 hours.`}>
        <span className="taper-budget" style={{ bottom: pct(budget) }}><i>3h budget</i></span>
        {weeks.map((w, i) => (
          <div key={w.label} className="taper-slot">
            <div className="taper-bar" style={{ height: pct(w.hours), '--i': i }}>
              {w.hours > budget && <span className="taper-over" style={{ height: `${((w.hours - budget) / w.hours) * 100}%` }} />}
            </div>
          </div>
        ))}
      </div>
      <div className="taper-labels" aria-hidden>
        {weeks.map((w) => (
          <div key={w.label} className="taper-slot">
            <span className="taper-val num">{w.hours}h</span>
            <span className="taper-label">{w.label}</span>
          </div>
        ))}
      </div>
    </figure>
  );
}

// Titles only; the how-to opens on click.
export default function Plan({ plan, taper }) {
  return (
    <section className="plate plan" aria-labelledby="plan-title">
      <header className="section-head">
        <h2 id="plan-title">Your plan</h2>
      </header>
      <ol className="plan-phases">
        {plan.map((phase, pi) => {
          const Icon = PHASE_ICON[pi] || Target;
          return (
            <li key={phase.phase} className="phase">
              <h3 className="phase-when"><Icon size={17} aria-hidden /> {phase.phase}</h3>
              <ul>
                {phase.items.map((it) => (
                  <li key={it.title}>
                    <details className="step">
                      <summary><span className="step-box" aria-hidden /><span>{it.title}</span><ChevronDown size={15} className="step-chev" aria-hidden /></summary>
                      <p>{it.detail}</p>
                    </details>
                  </li>
                ))}
              </ul>
            </li>
          );
        })}
      </ol>
      {taper.length > 1 && <Taper weeks={taper} />}
    </section>
  );
}
