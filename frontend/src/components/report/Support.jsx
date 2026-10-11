import { Check, LifeBuoy, X } from 'lucide-react';

export default function Support({ report }) {
  const { warning_signs: signs, support } = report;
  const present = signs.filter((s) => s.present).length;
  return (
    <section className={`plate support ${support.show ? 'is-urgent' : ''}`} aria-labelledby="support-title">
      <div className="support-signs">
        <header className="section-head">
          <h2 id="support-title">Warning signs</h2>
          <p>
            Patterns that overlap with the WHO's description of gaming disorder. This is a screening aid, not a
            diagnosis. {present === 0 ? 'None of them show up for you.' : `${present} of ${signs.length} show up for you.`}
          </p>
        </header>
        <ul className="signs">
          {signs.map((s) => (
            <li key={s.label} className={s.present ? 'is-present' : ''}>
              {s.present ? <X size={16} aria-hidden /> : <Check size={16} aria-hidden />}
              <span>{s.label}</span>
              <span className="sr-only">{s.present ? '(present)' : '(not present)'}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="support-help">
        <h3><LifeBuoy size={18} aria-hidden /> Talk to someone</h3>
        <p>{support.reason || "If gaming ever feels out of your control, or your mood stays low, these are free and confidential."}</p>
        <ul className="resources">
          {support.resources.map((r) => (
            <li key={r.name}><b>{r.name}</b><span>{r.detail}</span></li>
          ))}
        </ul>
      </div>
    </section>
  );
}
