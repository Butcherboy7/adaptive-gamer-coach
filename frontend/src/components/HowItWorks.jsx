import { ArrowRight, BedDouble, Clock, Moon, Zap } from 'lucide-react';

// Two small pictures of what happens after a player is picked. They use the real labels,
// meter and bar styles, with no numbers, so nothing here can be mistaken for a result.

function Meter({ children }) {
  return (
    <div className="band-meter">
      <div className="band-track">
        <span className="band band-ok" style={{ width: '40%' }} />
        <span className="band band-watch" style={{ width: '30%' }} />
        <span className="band band-risk" style={{ width: '30%' }} />
        {children}
      </div>
    </div>
  );
}

export function AdjustVisual() {
  const rows = [[BedDouble, 'Sleep'], [Zap, 'Stress'], [Clock, 'Daily play']];
  return (
    <div className="viz viz-adjust" aria-hidden>
      {rows.map((row, i) => {
        const Icon = row[0];
        const label = row[1];
        return (
        <div className="viz-slider" key={label} style={{ '--i': i }}>
          <span className="viz-row"><Icon size={15} />{label}</span>
          <span className="viz-track">
            <span className="viz-zone" style={{ width: `${34 + i * 6}%` }} />
            <span className="viz-thumb" />
          </span>
        </div>
        );
      })}
      <div className="viz-arrow-down"><ArrowRight size={16} /></div>
      <div className="viz-meter">
        <span className="viz-row">Anger risk</span>
        <Meter><span className="band-pin viz-pin" /></Meter>
      </div>
    </div>
  );
}

export function ReadVisual() {
  const rows = [[Zap, 'Stress', 'risk', 84], [Moon, 'Late nights', 'risk', 58], [BedDouble, 'Sleep', 'watch', 34]];
  return (
    <div className="viz viz-read" aria-hidden>
      <div className="viz-scores">
        <div className="viz-score">
          <span className="viz-row">Anger risk</span>
          <Meter><span className="band-pin" style={{ left: '62%' }} /></Meter>
        </div>
        <div className="viz-score">
          <span className="viz-row">Addiction</span>
          <span className="viz-levels"><i className="is-ok" /><i className="is-watch is-now" /><i className="is-risk" /></span>
        </div>
      </div>
      <div className="viz-factors">
        <span className="viz-row">What's pushing it up</span>
        {rows.map((row) => {
          const Icon = row[0];
          return (
            <div className="viz-factor" key={row[1]}>
              <span className="viz-row"><Icon size={14} />{row[1]}</span>
              <span className={`viz-bar viz-bar-${row[2]}`} style={{ width: `${row[3]}%` }} />
            </div>
          );
        })}
      </div>
      <div className="viz-next"><ArrowRight size={15} /><span className="viz-next-text">Plan: today, this week, this month</span></div>
    </div>
  );
}
