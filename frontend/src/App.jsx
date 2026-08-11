import { useState, useEffect } from 'react';
import axios from 'axios';
import PlayerForm from './components/PlayerForm';
import RiskGauge from './components/RiskGauge';
import AddictionMeter from './components/AddictionMeter';
import StatsRadar from './components/StatsRadar';
import CoachingPanel from './components/CoachingPanel';
import ExplainableAIPanel from './components/ExplainableAIPanel';
import { API_BASE_URL } from './constants';

// ─── Splash Screen ───
function SplashScreen({ onDone }) {
  useEffect(() => {
    const timer = setTimeout(onDone, 2000);
    return () => clearTimeout(timer);
  }, [onDone]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#0a0a0f]"
      style={{ animation: 'fade-out 0.4s ease-in 1.6s both' }}>
      
      {/* Hex grid overlay */}
      <div className="absolute inset-0 opacity-20" style={{
        backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='104' viewBox='0 0 60 104'%3E%3Cpath d='M30 0 L60 17.3 L60 52 L30 69.3 L0 52 L0 17.3Z' fill='none' stroke='%2300ff88' stroke-width='0.5'/%3E%3C/svg%3E\")"
      }} />
      
      <div className="relative mb-4 text-center px-4">
        <h1
          className="glitch-text font-orbitron font-black text-center leading-none"
          data-text="ADAPTIVE GAMER"
          style={{
            fontSize: 'clamp(1.8rem, 5vw, 3.5rem)',
            color: '#00ff88',
            textShadow: '0 0 20px #00ff88, 0 0 60px #00ff8844',
            animation: 'glitch 2s infinite',
          }}
        >
          ADAPTIVE GAMER
        </h1>
        <h1
          className="glitch-text font-orbitron font-black text-center leading-none"
          data-text="COACH"
          style={{
            fontSize: 'clamp(2.2rem, 6vw, 4.5rem)',
            color: '#00d4ff',
            textShadow: '0 0 20px #00d4ff, 0 0 60px #00d4ff44',
            animation: 'glitch 2s infinite 0.1s',
          }}
        >
          COACH
        </h1>
      </div>

      <p className="font-rajdhani text-sm tracking-widest text-[#64748b] animate-pulse mt-2">
        BEHAVIORAL INTELLIGENCE SYSTEM v1.0
      </p>

      <div className="mt-8 w-48 h-0.5 bg-[#1e1e2e] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full"
          style={{
            background: 'linear-gradient(90deg, #00ff88, #00d4ff)',
            boxShadow: '0 0 10px #00ff88',
            animation: 'load-bar 1.8s ease-out forwards',
          }}
        />
      </div>
      
      <style>{`
        @keyframes load-bar {
          from { width: 0%; }
          to { width: 100%; }
        }
        @keyframes fade-out {
          to { opacity: 0; pointer-events: none; }
        }
      `}</style>
    </div>
  );
}

// ─── Loading Overlay ───
const LOADING_TEXTS = [
  'Analyzing behavioral parameters...',
  'Extracting neural risk features...',
  'Running Random Forest & Gradient Boosting...',
  'Generating Explainable AI drivers...',
];

function LoadingOverlay() {
  const [textIndex, setTextIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setTextIndex(i => (i + 1) % LOADING_TEXTS.length);
    }, 600);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="fixed inset-0 z-40 flex flex-col items-center justify-center bg-[#0a0a0f]/80 backdrop-blur-md">
      <div className="relative w-16 h-16 mb-4">
        <div className="absolute inset-0 rounded-full border-2 border-t-[#00ff88] border-r-transparent border-b-[#00d4ff] border-l-transparent animate-spin" />
        <div className="absolute inset-2 rounded-full border-2 border-t-[#7c3aed] border-r-transparent border-b-[#ff2d55] border-l-transparent animate-spin"
          style={{ animationDirection: 'reverse', animationDuration: '0.8s' }} />
        <div className="absolute inset-0 flex items-center justify-center font-orbitron text-[10px] text-[#00ff88]">
          AI
        </div>
      </div>
      <p className="font-orbitron text-xs text-[#00ff88] tracking-widest animate-pulse">
        {LOADING_TEXTS[textIndex]}
      </p>
    </div>
  );
}

// ─── Main App Component ───
export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [prediction, setPrediction] = useState(null);
  const [lastInputValues, setLastInputValues] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleAnalyze = async (values) => {
    setIsLoading(true);
    setError(null);
    setLastInputValues(values);
    try {
      const response = await axios.post(`${API_BASE_URL}/predict`, values);
      setPrediction(response.data);
    } catch (err) {
      console.error('Prediction API Error:', err);
      setError(
        err.response?.data?.detail ||
        'Could not connect to AI server. Make sure Python backend is running on port 8000.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {showSplash && <SplashScreen onDone={() => setShowSplash(false)} />}
      {isLoading && <LoadingOverlay />}

      <div className="min-h-screen bg-[#0a0a0f] text-[#e2e8f0] relative overflow-x-hidden font-sans flex flex-col">
        
        {/* Top Compact Navbar */}
        <header className="border-b border-[#1e1e2e] bg-[#12121a]/90 backdrop-blur-md sticky top-0 z-30 px-4 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="text-lg">⚡</span>
            <div>
              <h1 className="font-orbitron font-bold text-xs sm:text-sm text-[#00ff88] tracking-wider flex items-center gap-2">
                ADAPTIVE GAMER COACH
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#7c3aed]/20 text-[#7c3aed] border border-[#7c3aed]/30 font-mono font-normal hidden sm:inline-block">
                  EXPLAINABLE ML v1.0
                </span>
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3 text-[11px] font-mono">
            <div className="flex items-center gap-1.5 text-[#64748b]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00ff88] animate-ping" />
              <span className="text-[#00ff88]">FASTAPI</span>
              <span className="hidden sm:inline">:8000</span>
            </div>
            <div className="px-2 py-0.5 rounded bg-[#1e1e2e] text-[#00d4ff] border border-[#00d4ff]/30 text-[10px] font-orbitron">
              ML ENGINE
            </div>
          </div>
        </header>

        {/* Error Banner */}
        {error && (
          <div className="bg-[#ff2d55]/10 border-b border-[#ff2d55] px-4 py-2 text-xs text-[#ff2d55] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-[#ff2d55] hover:text-white font-bold"
            >
              ✕
            </button>
          </div>
        )}

        {/* Optimized Responsive Layout */}
        <main className="w-full max-w-[1600px] mx-auto p-3 sm:p-4 lg:p-5 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-5">
          
          {/* Left Column: Input Form (5 cols on lg, 4 cols on xl) */}
          <aside className="lg:col-span-5 xl:col-span-4 bg-[#12121a] border border-[#1e1e2e] rounded-xl overflow-hidden shadow-2xl flex flex-col max-h-[850px] lg:h-[calc(100vh-80px)] lg:sticky lg:top-[65px]">
            <PlayerForm onSubmit={handleAnalyze} isLoading={isLoading} />
          </aside>

          {/* Right Column: Visualization Dashboard (7 cols on lg, 8 cols on xl) */}
          <section className="lg:col-span-7 xl:col-span-8 space-y-4">
            
            {/* Row 1: Key Predictive Metrics (RiskGauge + AddictionMeter) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <RiskGauge data={prediction} />
              <AddictionMeter data={prediction} />
            </div>

            {/* Row 2: Explainable AI Driver Analysis */}
            <ExplainableAIPanel prediction={prediction} inputValues={lastInputValues} />

            {/* Row 3: Behavioral Radar & Coaching Tips Side-by-Side on XL screens */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              <StatsRadar data={prediction} />
              <CoachingPanel data={prediction} />
            </div>

            {/* Footer */}
            <div className="text-center py-2">
              <p className="text-[11px] text-[#64748b]">
                Mallareddy University Department of Data Science · SRP/RTRP Project ·
                <span className="text-[#7c3aed]"> Behavioral ML Research</span>
              </p>
            </div>
          </section>
        </main>
      </div>
    </>
  );
}
