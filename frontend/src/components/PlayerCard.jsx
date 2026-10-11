import { Flag } from 'lucide-react';
import { RANK_COLORS, rankLabel } from '../constants';
import RankMark from './RankMark';
import { useCountUp, useEnterDelay } from '../motion';

function Stat({ label, value, decimals = Number.isInteger(value) ? 0 : 1, unit, title, delay }) {
  const shown = useCountUp(value, { decimals, delay, duration: 1200 });
  return (
    <div className="pc-stat" title={title}>
      <dt>{label}</dt>
      <dd className="num">{shown.toFixed(decimals)}{unit && <small>{unit}</small>}</dd>
    </div>
  );
}

function HourStrip({ byHour }) {
  // Re-order so the day reads 6 AM → 5 AM, with the late-night window (22–04) marked.
  const order = Array.from({ length: 24 }, (_, i) => (i + 6) % 24);
  const max = Math.max(...byHour, 0.001);
  const late = (h) => h >= 22 || h < 4;
  const lateShare = Math.round(byHour.reduce((s, v, h) => s + (late(h) ? v : 0), 0) * 100);
  return (
    <figure className="hours">
      <figcaption>
        <span>When they play</span>
        <span className="hours-late"><i /> {lateShare}% between 10 PM and 4 AM</span>
      </figcaption>
      <div className="hours-bars" role="img" aria-label={`Match start times by hour. ${lateShare}% start between 10 PM and 4 AM.`}>
        {order.map((h) => (
          <span key={h} className={late(h) ? 'is-late' : ''} style={{ height: `${Math.max(4, (byHour[h] / max) * 100)}%`, '--i': order.indexOf(h) }} />
        ))}
      </div>
      <div className="hours-axis" aria-hidden>
        <span>6a</span><span>12p</span><span>6p</span><span>12a</span><span>5a</span>
      </div>
    </figure>
  );
}

export default function PlayerCard({ player }) {
  const { rank, stats } = player;
  const color = RANK_COLORS[rank.rank];
  const enter = useEnterDelay();
  const d = enter * 1000 + 250;
  return (
    <section className="plate player-card" aria-label="Player profile" style={{ '--rank': color, '--enter': `${enter}s` }}>
      <header className="pc-head">
        <RankMark rank={rank.rank} size={52} />
        <div className="pc-id">
          <h2 className="pc-name">
            <span className="riot-name">{player.game_name}</span>
            <span className="riot-tag">#{player.tag}</span>
          </h2>
          <p className="pc-sub">
            <span className="pc-rank">{rankLabel(rank)}</span>
            <span>{rank.rr} RR</span>
            <span>{player.region_label}</span>
            <span>Lvl {player.account_level}</span>
          </p>
        </div>
      </header>

      <dl className="pc-stats">
        <Stat label="K/D" value={stats.kd} decimals={2} delay={d} />
        <Stat label="HS%" value={stats.hs_pct} unit="%" delay={d + 60} />
        <Stat label="ACS" value={stats.acs} delay={d + 120} />
        <Stat label="Win" value={stats.win_rate} unit="%" delay={d + 180} />
        <Stat label="Games 7d" value={stats.matches_7d} title="Matches in the last 7 days" delay={d + 240} />
        <Stat label="Hrs 30d" value={stats.hours_30d} title="Hours played in the last 30 days" delay={d + 300} />
      </dl>

      <div className="pc-agents">
        {player.agents.map((a, i) => (
          <div key={a.name} className="pc-agent" style={{ '--i': i }}>
            <span className="pc-agent-name">{a.name}</span>
            <span className="pc-agent-role">{a.role}</span>
            <span className="pc-agent-bar"><span style={{ width: `${a.pick_rate}%` }} /></span>
            <span className="num pc-agent-pct">{a.pick_rate}%</span>
          </div>
        ))}
      </div>

      <div className="pc-matches">
        <div className="pc-matches-head">
          <span>Last 10 matches</span>
          {stats.surrenders_10 > 0 && (
            <span className="pc-ff"><Flag size={13} aria-hidden /> {stats.surrenders_10} surrendered</span>
          )}
        </div>
        <ol className="match-strip">
          {player.matches.map((m, i) => (
            <li
              key={i}
              style={{ '--i': i }}
              className={`match ${m.result === 'W' ? 'is-win' : 'is-loss'} ${m.surrendered ? 'is-ff' : ''}`}
              title={`${m.result === 'W' ? 'Win' : 'Loss'} ${m.score} on ${m.map} as ${m.agent}, ${m.kda} KDA, ${m.acs} ACS, started ${String(m.hour).padStart(2, '0')}:00${m.surrendered ? ' (surrendered)' : ''}`}
            >
              <span className="match-res">{m.result}</span>
              <span className="match-score num">{m.score}</span>
              <span className="match-map">{m.map}</span>
            </li>
          ))}
        </ol>
      </div>

      <HourStrip byHour={player.by_hour} />

      <p className="pc-foot">Synced {player.updated_minutes_ago} min ago</p>
    </section>
  );
}
