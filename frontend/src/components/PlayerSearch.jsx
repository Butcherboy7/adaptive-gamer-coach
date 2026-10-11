import { useEffect, useId, useRef, useState } from 'react';
import { Search, CornerDownLeft, LoaderCircle } from 'lucide-react';
import { api } from '../api';
import { RANK_COLORS, rankLabel } from '../constants';
import RankMark from './RankMark';

export default function PlayerSearch({ onSelect, loading }) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [results, setResults] = useState([]);
  const [active, setActive] = useState(0);
  const boxRef = useRef(null);
  const inputRef = useRef(null);
  const listId = useId();

  useEffect(() => {
    const ctrl = new AbortController();
    const t = setTimeout(() => {
      api.search(query, ctrl.signal)
        .then((d) => { setResults(d.results); setActive(0); })
        .catch(() => {});
    }, 120);
    return () => { clearTimeout(t); ctrl.abort(); };
  }, [query]);

  useEffect(() => {
    const close = (e) => { if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false); };
    const slash = (e) => {
      if (e.key === '/' && document.activeElement?.tagName !== 'INPUT') { e.preventDefault(); inputRef.current?.focus(); }
    };
    document.addEventListener('mousedown', close);
    document.addEventListener('keydown', slash);
    return () => { document.removeEventListener('mousedown', close); document.removeEventListener('keydown', slash); };
  }, []);

  const trimmed = query.trim();
  const showLookup = trimmed.length > 0 && !results.some((r) => r.riot_id.toLowerCase() === trimmed.toLowerCase());
  const options = [...results.map((r) => ({ type: 'player', ...r })), ...(showLookup ? [{ type: 'lookup', riot_id: trimmed.includes('#') ? trimmed : `${trimmed}#NA1` }] : [])];

  const choose = (opt) => {
    if (!opt) return;
    setQuery(opt.riot_id);
    setOpen(false);
    inputRef.current?.blur();
    onSelect(opt.riot_id);
  };

  const onKeyDown = (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setOpen(true); setActive((a) => Math.min(a + 1, options.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)); }
    else if (e.key === 'Enter') { e.preventDefault(); choose(options[active]); }
    else if (e.key === 'Escape') { setOpen(false); }
  };

  return (
    <div className="search" ref={boxRef}>
      <div className="search-field">
        {loading ? <LoaderCircle className="search-icon spin" size={18} aria-hidden /> : <Search className="search-icon" size={18} aria-hidden />}
        <input
          ref={inputRef}
          type="text"
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          aria-activedescendant={open && options[active] ? `${listId}-${active}` : undefined}
          aria-label="Search a Riot ID"
          placeholder="Search a Riot ID, e.g. kyuu#0711"
          value={query}
          spellCheck="false"
          autoComplete="off"
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
        />
        <kbd className="search-kbd" aria-hidden>/</kbd>
      </div>

      {open && options.length > 0 && (
        <ul className="search-list" id={listId} role="listbox" aria-label="Players">
          {!trimmed && <li className="search-caption" role="presentation">Featured players</li>}
          {options.map((opt, i) => (
            <li
              key={opt.riot_id + opt.type}
              id={`${listId}-${i}`}
              role="option"
              aria-selected={i === active}
              className={`search-option ${i === active ? 'is-active' : ''}`}
              onMouseEnter={() => setActive(i)}
              onMouseDown={(e) => { e.preventDefault(); choose(opt); }}
            >
              {opt.type === 'player' ? (
                <>
                  <RankMark rank={opt.rank.rank} size={22} />
                  <span className="search-name">
                    <span className="riot-name">{opt.game_name}</span>
                    <span className="riot-tag">#{opt.tag}</span>
                  </span>
                  <span className="search-meta">
                    <span style={{ color: RANK_COLORS[opt.rank.rank] }}>{rankLabel(opt.rank)}</span>
                    <span>{opt.main_agent}</span>
                    <span>{opt.region}</span>
                  </span>
                </>
              ) : (
                <>
                  <CornerDownLeft size={18} className="search-lookup-icon" aria-hidden />
                  <span className="search-name">Look up <strong>{opt.riot_id}</strong></span>
                  <span className="search-meta"><span>Search all regions</span></span>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
