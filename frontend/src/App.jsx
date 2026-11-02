import { useCallback, useEffect, useState } from 'react';
import { AlertTriangle, ArrowRight, SlidersHorizontal, X } from 'lucide-react';
import { api } from './api';
import { useEnterDelay, useReveal } from './motion';
import Intro from './components/Intro';
import { DEFAULT_VALUES, rankLabel } from './constants';
import PlayerSearch from './components/PlayerSearch';
import { AdjustVisual, ReadVisual } from './components/HowItWorks';
import PlayerCard from './components/PlayerCard';
import QuickForm from './components/QuickForm';
import InputsPanel from './components/InputsPanel';
import RankMark from './components/RankMark';
import Summary from './components/report/Summary';
import Problems from './components/report/Problems';
import Plan from './components/report/Plan';
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

// Below-the-fold sections build when scrolled to.
function Reveal({ index = 0, children }) {
  const [ref, inView] = useReveal();
  return <div ref={ref} className={`reveal ${inView ? 'is-in' : ''}`} style={{ '--i': index }}>{children}</div>;
}

// Keyed by player, so the report builds in again when a new player loads.
function Report({ result }) {
  const r = result.report;
  const enter = useEnterDelay();
  return (
    <div className="report-body" style={{ '--enter': `${enter}s` }}>
      <Summary data={result} />
      <Problems drivers={r.drivers} />
      <Reveal><Plan plan={r.plan} taper={r.taper} /></Reveal>
      <Reveal><Support report={r} /></Reveal>
      <Reveal><ModelCard meta={result.deep_learning_meta} /></Reveal>
    </div>
  );
}

const STATUS_LABEL = { checking: 'Connecting…', online: 'Models online', degraded: 'Models not loaded', offline: 'Server offline' };

function EmptyReport({ onPick, onSearch, loading, onManual }) {
  const enter = useEnterDelay();
  const [featured, setFeatured] = useState([]);
  useEffect(() => { api.search('').then((d) => setFeatured(d.results.slice(0, 4))).catch(() => {}); }, []);
  return (
    <section className="empty" aria-labelledby="empty-title" style={{ '--enter': `${enter}s` }}>
      <h2 id="empty-title" className="empty-title">
        <span className="mask-line"><span style={{ '--d': '0ms' }}>Check a player's</span></span>
        <span className="mask-line"><span style={{ '--d': '110ms' }}>anger and gaming habits</span></span>
      </h2>
      <div className="flow">
        <article className="flow-step is-start" style={{ '--i': 0 }}>
          <header className="flow-head"><span className="steps-n">1</span><h3>Pick a player</h3></header>
          <PlayerSearch onSelect={onSearch} loading={loading} large />
          <ul className="flow-picks">
            {featured.map((p) => (
              <li key={p.riot_id}>
                <button type="button" className="pick" onClick={() => onPick(p.riot_id)}>
                  <RankMark rank={p.rank.rank} size={26} />
                  <span className="pick-name"><span className="riot-name">{p.game_name}</span><span className="riot-tag">#{p.tag}</span></span>
                  <span className="pick-meta">{rankLabel(p.rank)} · {p.main_agent}</span>
                </button>
              </li>
            ))}
          </ul>
          <button type="button" className="btn-quiet" onClick={onManual}>
            <SlidersHorizontal size={15} aria-hidden /> Or type your own numbers
          </button>
        </article>

        <ArrowRight className="flow-arrow" size={22} aria-hidden style={{ '--i': 0 }} />

        <article className="flow-step" style={{ '--i': 1 }}>
          <header className="flow-head"><span className="steps-n">2</span><h3>Move the sliders</h3></header>
          <AdjustVisual />
          <p className="flow-cap">The result updates live</p>
        </article>

        <ArrowRight className="flow-arrow" size={22} aria-hidden style={{ '--i': 1 }} />

        <article className="flow-step" style={{ '--i': 2 }}>
          <header className="flow-head"><span className="steps-n">3</span><h3>Get the plan</h3></header>
          <ReadVisual />
          <p className="flow-cap">What drives it, what to do</p>
        </article>
      </div>
      <p className="empty-note">Demo players are synthetic profiles, not real people.</p>
    </section>
  );
}

export default function App() {
  const enter = useEnterDelay();
  const apiStatus = useApiStatus();
  const [player, setPlayer] = useState(null);
  const [baseValues, setBaseValues] = useState(DEFAULT_VALUES);
  const [values, setValues] = useState(DEFAULT_VALUES);
  const [started, setStarted] = useState(false);
  const [manual, setManual] = useState(false);
  const [tags, setTags] = useState({});
  const [baseTags, setBaseTags] = useState({});
  const [result, setResult] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [lookingUp, setLookingUp] = useState(false);
  const [error, setError] = useState(null);

  const selectPlayer = useCallback(async (riotId) => {
    setLookingUp(true);
    setError(null);
    try {
      const p = await api.lookup(riotId);
      setPlayer(p);
      setBaseValues(p.inputs);
      setTags({});
      setBaseTags({});
      setManual(false);
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

  const startManual = () => { setPlayer(null); setManual(true); };

  const finishManual = (vals, t) => {
    setPlayer(null);
    setBaseValues(vals);
    setValues(vals);
    setTags(t);
    setBaseTags(t);
    setStarted(true);
    window.scrollTo(0, 0);
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

  const onChange = (key, v) => {
    setValues((prev) => ({ ...prev, [key]: v }));
    setTags((prev) => {
      if (!(key in prev)) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
    setStarted(true);
  };
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
          <span className="wordmark-text">Adaptive Gamer <b>Coach</b></span>
        </a>
        {started ? <PlayerSearch onSelect={selectPlayer} loading={lookingUp} /> : <span />}
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

      <main className={`layout ${started ? '' : 'is-empty'}`}>
        {started && (
        <aside className="side enter-side">
          {player && <PlayerCard player={player} key={player.riot_id} />}
          <InputsPanel
            values={values}
            onChange={onChange}
            onReset={() => { setValues(baseValues); setTags(baseTags); }}
            dirty={dirty}
            hasPlayer={!!player}
            result={result}
            tags={tags}
            busy={analyzing}
          />
        </aside>
        )}

        <div className={`report ${analyzing && result ? 'is-updating' : ''}`} aria-live="polite" aria-busy={analyzing}>
          {!started || !result ? (
            started ? (
              <div className="report-loading" role="status">
                <span className="scan" aria-hidden />
                Running the models…
              </div>
            ) : manual ? <QuickForm onDone={finishManual} onBack={() => setManual(false)} />
              : <EmptyReport onPick={selectPlayer} onSearch={selectPlayer} loading={lookingUp} onManual={startManual} />
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
