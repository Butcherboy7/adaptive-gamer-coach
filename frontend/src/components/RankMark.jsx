import { RANK_COLORS, } from '../constants';

const ORDER = ['Iron', 'Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond', 'Ascendant', 'Immortal', 'Radiant'];

// A simple faceted rank badge: shape gains facets as the rank climbs.
export default function RankMark({ rank, size = 28 }) {
  const color = RANK_COLORS[rank] || '#888';
  const idx = Math.max(0, ORDER.indexOf(rank));
  const pips = Math.min(3, Math.floor(idx / 3) + 1);
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden className="rank-mark">
      <path d="M16 2 L29 11 L24 29 L8 29 L3 11 Z" fill={color} opacity="0.18" />
      <path d="M16 2 L29 11 L24 29 L8 29 L3 11 Z" fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" />
      {Array.from({ length: pips }).map((_, i) => (
        <path key={i} d={`M${10 + i * 0} ${21 - i * 5} L16 ${17 - i * 5} L22 ${21 - i * 5}`} fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      ))}
    </svg>
  );
}
