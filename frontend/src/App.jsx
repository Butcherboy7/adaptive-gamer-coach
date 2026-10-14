import { useCallback, useEffect, useRef, useState } from 'react';
import { AlertTriangle, SlidersHorizontal, X } from 'lucide-react';
import { api } from './api';
import { useEnterDelay, useReveal } from './motion';
import Intro from './components/Intro';
import { DEFAULT_VALUES, rankLabel } from './constants';
import PlayerSearch from './components/PlayerSearch';
import PlayerCard from './components/PlayerCard';
import InputsPanel from './components/InputsPanel';
import RankMark from './components/RankMark';
import Verdict from './components/report/Verdict';
import Scores from './components/report/Scores';
import FactorBoard from './components/report/FactorBoard';
import Plan from './components/report/Plan';
import Matchup from './components/report/Matchup';
import Support from './components/report/Support';
import ModelCard from './components/report/ModelCard';

function useApiStatus() {
  const [status, setStatus] = useState('checking');
  useEffect(() => {
    let alive = true;
    const check = () => api.health()
      .then((d) => alive && setStatus(d.models_loaded ? 'online' : 'degraded'))
      .catch(() => alive && setStatus('offline'));
    check();
    const t = setInterval(check, 15000);
    return () => { alive = false; clearInterval(t); };
  }, []);
  return status;
}

function Reveal({ children, index = 0 }) {
  const [ref, inView] = useReveal();
  return (
    <div ref={ref} className={`reveal ${inView ? 'is-in' : ''}`} style={{ '--i': index }}>
      {children}
    </div>
  );
}

// Keyed by player, so the whole broadcast cascade replays when a new player loads.
function Report({ result }) {
  const enter = useEnterDelay();
  const r = result.report;
  return (
    <div className="report-body" style={{ '--enter': `${enter}s` }}>
      <div className="enter" style={{ '--d': '0ms' }}><Verdict data={result} /></div>
      <div className="enter" style={{ '--d': '220ms' }}><Scores data={result} enter={enter} /></div>
      <div className="enter" style={{ '--d': '380ms' }}><FactorBoard drivers={r.drivers} /></div>
      <Reveal><Plan plan={r.plan} taper={r.taper} /></Reveal>
      {r.projected.changes.length > 0 && <Reveal><Matchup data={result} /></Reveal>}
      <Reveal><Support report={r} /></Reveal>
      <Reveal><ModelCard meta={result.deep_learning_meta} /></Reveal>
    </div>
  );
}

const STATUS_LABEL = { checking: 'Connecting…', online: 'Models online', degraded: 'Models not loaded', offline: 'Server offline' };

function EmptyReport({ onPick, onManual }) {
  const [featured, setFeatured] = useState([]);
  useEffect(() => { api.search('').then((d) => setFeatured(d.results.slice(0, 6))).catch(() => {}); }, []);
  return (
    <section className="empty" aria-labelledby="empty-title">
      <h2 id="empty-title" className="empty-title">
        <span className="mask-line"><span style={{ '--d': '0ms' }}>Scout a player.</span></span>
        <span className="mask-line"><span style={{ '--d': '110ms' }}>Get a <em>game plan.</em></span></span>
      </h2>
      <p className="empty-lede enter" style={{ '--d': '320ms' }}>
        Adaptive Gamer Coach reads a player's match habits and weekly check-in, predicts their risk of tilting and of
        gaming addiction, shows exactly which factors drive it, and writes a step-by-step plan to fix it.
      </p>
      <div className="empty-picks enter" style={{ '--d': '420ms' }}>
        <h3>Try a player</h3>
        <ul>
          {featured.map((p, i) => (
            <li key={p.riot_id} className="enter" style={{ '--d': `${520 + i * 70}ms` }}>
              <button type="button" className="pick" onClick={() => onPick(p.riot_id)}>
                <RankMark rank={p.rank.rank} size={26} />
                <span className="pick-name"><span className="riot-name">{p.game_name}</span><span className="riot-tag">#{p.tag}</span></span>
                <span className="pick-meta">{rankLabel(p.rank)} · {p.main_agent}</span>
              </button>
            </li>
          ))}
        </ul>
        <button type="button" className="btn-quiet" onClick={onManual}>
          <SlidersHorizontal size={15} aria-hidden /> Or enter your own numbers
        </button>
      </div>
    </section>
  );
}

export default function App() {
  const apiStatus = useApiStatus();
  const enter = useEnterDelay();
  const [player, setPlayer] = useState(null);
  const [baseValues, setBaseValues] = useState(DEFAULT_VALUES);
  const [values, setValues] = useState(DEFAULT_VALUES);
  const [started, setStarted] = useState(false);
  const [result, setResult] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [lookingUp, setLookingUp] = useState(false);
  const [error, setError] = useState(null);
  const reportRef = useRef(null);

  const selectPlayer = useCallback(async (riotId) => {
    setLookingUp(true);
    setError(null);
    try {
      const p = await api.lookup(riotId);
      setPlayer(p);
      setBaseValues(p.inputs);
      setValues(p.inputs);
      setStarted(true);
    } catch (e) {
      setError(e.message);
    } finally {
      setLookingUp(false);
    }
  }, []);

  // Deep link: ?player=kyuu%230711 opens straight into that player's report.
  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get('player');
    if (!id) return undefined;
    const t = setTimeout(() => selectPlayer(id), 0);
    return () => clearTimeout(t);
  }, [selectPlayer]);

  const startManual = () => {
    setPlayer(null);
    setBaseValues(DEFAULT_VALUES);
    setValues(DEFAULT_VALUES);
    setStarted(true);
  };

  // Live analysis: re-run the models whenever inputs change (debounced, latest request wins).
  useEffect(() => {
    if (!started) return;
    const ctrl = new AbortController();
    const t = setTimeout(async () => {
      setAnalyzing(true);
      try {
        const data = await api.predict(values, ctrl.signal);
        setResult(data);
        setError(null);
      } catch (e) {
        if (e.name !== 'AbortError') setError(e.message);
      } finally {
        if (!ctrl.signal.aborted) setAnalyzing(false);
      }
    }, 220);
    return () => { clearTimeout(t); ctrl.abort(); };
  }, [values, started]);

  const onChange = (key, v) => { setValues((prev) => ({ ...prev, [key]: v })); setStarted(true); };
  const dirty = Object.keys(values).some((k) => values[k] !== baseValues[k]);
  const subject = player ? player.riot_id : 'Your numbers';

  return (
    <div className="app" style={{ '--enter': `${enter}s` }}>
      <Intro />
      <header className="topbar enter-down">
        <a className="wordmark" href="/" aria-label="Adaptive Gamer Coach home">
          <svg width="26" height="26" viewBox="0 0 32 32" aria-hidden>
            <path className="wm-line" d="M4 26 L16 4 L28 26 Z" fill="none" stroke="currentColor" strokeWidth="3" strokeLinejoin="round" pathLength="1" />
            <path className="wm-wedge" d="M10 26 L16 15 L22 26" fill="var(--red)" />
          </svg>
          <span>Adaptive Gamer <b>Coach</b></span>
        </a>
        <PlayerSearch onSelect={selectPlayer} loading={lookingUp} />
        <span className={`api-status is-${apiStatus}`} role="status">
          <i aria-hidden /> {STATUS_LABEL[apiStatus]}
        </span>
      </header>

      {error && (
        <div className="alert" role="alert">
          <AlertTriangle size={18} aria-hidden />
          <span>{error}</span>
          <button type="button" aria-label="Dismiss" onClick={() => setError(null)}><X size={16} /></button>
        </div>
      )}

      <main className="layout">
        <aside className="side enter-side">
          {player && <PlayerCard player={player} key={player.riot_id} />}
          <InputsPanel
            values={values}
            onChange={onChange}
            onReset={() => setValues(baseValues)}
            dirty={dirty}
            hasPlayer={!!player}
          />
        </aside>

        <div className={`report ${analyzing && result ? 'is-updating' : ''}`} ref={reportRef} aria-live="polite" aria-busy={analyzing}>
          {!started || !result ? (
            started ? (
              <div className="report-loading" role="status">
                <span className="scan" aria-hidden />
                Running the models…
              </div>
            ) : <EmptyReport onPick={selectPlayer} onManual={startManual} />
          ) : (
            <Report result={result} key={subject} />
          )}
        </div>
      </main>

      <footer className="footer">
        <span>Mallareddy University</span>
        <span>Coaching guidance, not a medical diagnosis.</span>
      </footer>
    </div>
  );
}
