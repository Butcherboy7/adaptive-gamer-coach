function Taper({ weeks }) {
  const budget = 3;
  const top = Math.ceil(Math.max(...weeks.map((w) => w.hours), budget + 1));
  // Bars, the budget line and the overshoot all share one plot box, so they agree with the numbers.
  const pct = (v) => `${(v / top) * 100}%`;
  return (
    <figure className="taper">
      <figcaption>
        <b>Step-down schedule</b> Daily play cap each week, cutting about 20% a week until you're within the 3-hour budget.
        Red is time over budget.
      </figcaption>
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

export default function Plan({ plan, taper }) {
  return (
    <section className="plate plan" aria-labelledby="plan-title">
      <header className="section-head">
        <h2 id="plan-title">Your recovery plan</h2>
        <p>Built from your own numbers. Start with today, and don't try to change everything at once.</p>
      </header>
      <ol className="plan-phases">
        {plan.map((phase) => (
          <li key={phase.phase} className="phase">
            <h3 className="phase-when">{phase.phase}</h3>
            <ul>
              {phase.items.map((it) => (
                <li key={it.title}>
                  <b>{it.title}</b>
                  <span>{it.detail}</span>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ol>
      {taper.length > 1 && <Taper weeks={taper} />}
    </section>
  );
}
