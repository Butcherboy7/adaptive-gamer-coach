import React, { useState, useEffect, useRef } from 'react';
import { SLIDER_CONFIG, SECTIONS, DEFAULT_VALUES, DUMMY_PLAYERS } from '../constants';

// ─── Tooltip Component ───
function Tooltip({ text }) {
  return (
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-[#1e1e2e] border border-[#334155] rounded shadow-lg text-xs text-[#e2e8f0] z-50 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
      {text}
      <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#334155]" />
    </div>
  );
}

// ─── Slider Input Component ───
function SliderInput({ id, config, value, onChange }) {
  const getBadgeColor = (val, max) => {
    const ratio = val / max;
    if (ratio < 0.4) return 'bg-[#00ff88] text-[#0a0a0f] shadow-[#00ff88]';
    if (ratio < 0.7) return 'bg-[#fbbf24] text-[#0a0a0f] shadow-[#fbbf24]';
    return 'bg-[#ff2d55] text-white shadow-[#ff2d55]';
  };

  const percentage = ((value - config.min) / (config.max - config.min)) * 100;

  return (
    <div className="mb-5 last:mb-0">
      <div className="flex justify-between items-center mb-2">
        <label htmlFor={id} className="text-sm font-rajdhani font-semibold text-[#e2e8f0] flex items-center gap-2 relative group cursor-help">
          {config.label}
          <span className="w-4 h-4 rounded-full bg-[#334155] flex items-center justify-center text-[10px] text-[#94a3b8] group-hover:bg-[#475569] transition-colors">
            ?
          </span>
          <Tooltip text={config.tooltip} />
        </label>
        <div className={`px-2 py-0.5 rounded text-xs font-mono font-bold transition-all duration-300 shadow-[0_0_8px_var(--tw-shadow-color)] ${getBadgeColor(value, config.max)}`}>
          {value}
        </div>
      </div>
      <div className="relative h-2 bg-[#1e1e2e] rounded-full overflow-hidden">
        <div 
          className="absolute top-0 left-0 h-full rounded-full transition-all duration-300"
          style={{ 
            width: `${percentage}%`,
            background: 'linear-gradient(90deg, #00ff88, #00d4ff)',
            boxShadow: '0 0 10px #00d4ff88'
          }}
        />
        <input
          type="range"
          id={id}
          min={config.min}
          max={config.max}
          step={config.step}
          value={value}
          onChange={(e) => onChange(id, parseFloat(e.target.value))}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
      </div>
    </div>
  );
}

// ─── Mode Toggle Component ───
function ModeToggle({ activeMode, onToggle }) {
  return (
    <div className="flex bg-[#1e1e2e] rounded-full p-1 mb-6 relative overflow-hidden ring-1 ring-white/5">
      <div 
        className="absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-full bg-[#00ff88] transition-all duration-300 ease-out shadow-[0_0_15px_#00ff8888]"
        style={{ left: activeMode === 'manual' ? '4px' : 'calc(50% + 4px)' }}
      />
      <button
        onClick={() => onToggle('manual')}
        className={`flex-1 relative z-10 py-2 text-xs font-orbitron tracking-widest font-bold transition-colors duration-300 ${activeMode === 'manual' ? 'text-[#0a0a0f]' : 'text-[#64748b] hover:text-[#94a3b8]'}`}
      >
        🎮 MANUAL INPUT
      </button>
      <button
        onClick={() => onToggle('riot')}
        className={`flex-1 relative z-10 py-2 text-xs font-orbitron tracking-widest font-bold transition-colors duration-300 ${activeMode === 'riot' ? 'text-[#0a0a0f]' : 'text-[#64748b] hover:text-[#94a3b8]'}`}
      >
        🔍 RIOT ID SEARCH
      </button>
    </div>
  );
}

// ─── Riot Search Component ───
function RiotSearch({ onSelectPlayer, selectedPlayer, onEditSliders }) {
  const [query, setQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [customPlayers, setCustomPlayers] = useState({});
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter existing dummy players
  const filteredPlayers = DUMMY_PLAYERS.filter(p => 
    p.riotId.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 5);

  const getRankColor = (rank) => {
    switch(rank) {
      case 'Iron': return 'bg-gray-500';
      case 'Bronze': return 'bg-[#cd7f32]';
      case 'Silver': return 'bg-[#c0c0c0]';
      case 'Gold': return 'bg-[#ffd700]';
      case 'Platinum': return 'bg-teal-500';
      case 'Diamond': return 'bg-[#00d4ff]';
      case 'Ascendant': return 'bg-[#00ff88]';
      case 'Immortal': return 'bg-[#ff2d55]';
      case 'Radiant': return 'bg-[#fbbf24]';
      default: return 'bg-gray-500';
    }
  };

  // Helper to generate a fake player profile dynamically on the fly if non-preset Riot ID typed
  const generateDynamicPlayer = (riotId) => {
    if (customPlayers[riotId.toLowerCase()]) {
      return customPlayers[riotId.toLowerCase()];
    }

    // Seeded pseudo-random numbers from Riot ID string
    let hash = 0;
    for (let i = 0; i < riotId.length; i++) {
      hash = riotId.charCodeAt(i) + ((hash << 5) - hash);
    }
    const pseudoRand = (offset) => {
      const x = Math.sin(hash + offset) * 10000;
      return x - Math.floor(x);
    };

    const ranks = ['Gold', 'Platinum', 'Diamond', 'Ascendant', 'Immortal', 'Radiant'];
    const agents = ['Jett', 'Reyna', 'Omen', 'Sova', 'Killjoy', 'Chamber', 'Fade', 'Iso'];
    
    const rank = ranks[Math.floor(pseudoRand(1) * ranks.length)];
    const agent = agents[Math.floor(pseudoRand(2) * agents.length)];
    const hours = Math.floor(pseudoRand(3) * 2500) + 300;
    const winRate = `${Math.floor(pseudoRand(4) * 25) + 45}%`;

    const generatedPreset = {
      stress_level: Math.floor(pseudoRand(5) * 8) + 2,
      anxiety_score: Math.round((pseudoRand(6) * 7 + 2) * 10) / 10,
      aggression_score: Math.round((pseudoRand(7) * 7 + 2) * 10) / 10,
      loneliness_score: Math.round((pseudoRand(8) * 8 + 1) * 10) / 10,
      social_interaction_score: Math.round((pseudoRand(9) * 8 + 1) * 10) / 10,
      happiness_score: Math.round((pseudoRand(10) * 6 + 3) * 10) / 10,
      depression_score: Math.round((pseudoRand(11) * 6 + 1) * 10) / 10,
      daily_gaming_hours: Math.round((pseudoRand(12) * 10 + 2) * 2) / 2,
      weekly_sessions: Math.floor(pseudoRand(13) * 35) + 5,
      night_gaming_ratio: Math.round((pseudoRand(14) * 0.8 + 0.1) * 100) / 100,
      sleep_hours: Math.round((pseudoRand(15) * 6 + 4) * 2) / 2,
      toxic_exposure: Math.round((pseudoRand(16) * 0.8 + 0.1) * 100) / 100,
      microtransactions_spending: Math.floor(pseudoRand(17) * 250) + 10,
      years_gaming: Math.floor(pseudoRand(18) * 12) + 1,
    };

    const newProfile = {
      riotId,
      rank,
      agent,
      hours,
      winRate,
      presetValues: generatedPreset,
      isGenerated: true,
    };

    setCustomPlayers(prev => ({ ...prev, [riotId.toLowerCase()]: newProfile }));
    return newProfile;
  };

  const handleSelect = (player) => {
    setQuery(player.riotId);
    setIsDropdownOpen(false);
    onSelectPlayer(player);
  };

  const handleCreateAndSelect = () => {
    if (!query.trim()) return;
    const profile = generateDynamicPlayer(query.trim());
    handleSelect(profile);
  };

  return (
    <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-top-4 duration-300">
      <div className="relative" ref={dropdownRef}>
        <div className="relative flex items-center">
          <span className="absolute left-3 text-[#00d4ff]">🔍</span>
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsDropdownOpen(true);
            }}
            onFocus={() => setIsDropdownOpen(true)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleCreateAndSelect();
            }}
            placeholder="Enter Riot ID (e.g. TenZ#NA1 or your name)"
            className="w-full bg-[#12121a] border border-[#00d4ff] rounded-lg py-3 pl-10 pr-4 text-[#00d4ff] font-mono focus:outline-none focus:ring-2 focus:ring-[#00d4ff]/50 shadow-[0_0_10px_#00d4ff44] transition-shadow placeholder:text-[#334155]"
            spellCheck="false"
          />
        </div>

        {isDropdownOpen && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-[#12121a] border border-[#334155] rounded-lg shadow-2xl overflow-hidden z-20 max-h-64 overflow-y-auto">
            {filteredPlayers.length > 0 ? (
              filteredPlayers.map(player => (
                <div
                  key={player.riotId}
                  onClick={() => handleSelect(player)}
                  className="flex justify-between items-center p-3 cursor-pointer hover:bg-[#1e1e2e] border-l-2 border-transparent hover:border-[#00d4ff] transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-3 h-3 rounded-full ${getRankColor(player.rank)} shadow-[0_0_5px_currentColor] opacity-80 group-hover:opacity-100`} />
                    <div>
                      <div className="font-mono text-sm text-[#e2e8f0] group-hover:text-[#00d4ff] transition-colors">{player.riotId}</div>
                      <div className="text-xs text-[#64748b]">{player.agent}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-[#00d4ff]">{player.hours} hrs</div>
                    <div className="text-xs text-[#00ff88]">{player.winRate} Win</div>
                  </div>
                </div>
              ))
            ) : null}

            {/* Dynamic Generator Option for ANY custom Riot ID */}
            {query.trim().length > 0 && (
              <div
                onClick={handleCreateAndSelect}
                className="p-3 bg-[#7c3aed]/10 hover:bg-[#7c3aed]/20 border-t border-[#334155] cursor-pointer flex items-center justify-between text-xs text-[#00ff88] font-mono group"
              >
                <div className="flex items-center gap-2">
                  <span>⚡</span>
                  <span>Generate AI Profile for <strong>"{query}"</strong></span>
                </div>
                <span className="font-orbitron text-[10px] text-[#7c3aed] group-hover:text-white transition-colors">
                  LOAD PROFILE →
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {selectedPlayer && (
        <div className="bg-[#12121a] border-l-4 border-[#00d4ff] rounded-r-lg p-4 shadow-lg animate-in fade-in zoom-in-95 duration-300 relative overflow-hidden">
          {selectedPlayer.isGenerated && (
            <span className="absolute top-2 right-2 text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-[#7c3aed]/20 text-[#7c3aed] border border-[#7c3aed]/40">
              AI SYNTHESIZED
            </span>
          )}

          <div className="flex justify-between items-center mb-3 pr-16">
            <h3 className="font-orbitron font-bold text-lg text-white">{selectedPlayer.riotId}</h3>
            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded bg-[#1e1e2e] text-white border border-white/10 flex items-center gap-2`}>
               <span className={`w-2 h-2 rounded-full ${getRankColor(selectedPlayer.rank)}`} />
               {selectedPlayer.rank}
            </span>
          </div>
          
          <div className="grid grid-cols-3 gap-2 mb-4">
            <div className="bg-[#1e1e2e] rounded p-2 text-center border border-white/5">
              <div className="text-[10px] text-[#94a3b8] uppercase mb-1">Agent</div>
              <div className="font-mono text-sm text-[#e2e8f0]">{selectedPlayer.agent}</div>
            </div>
            <div className="bg-[#1e1e2e] rounded p-2 text-center border border-white/5">
              <div className="text-[10px] text-[#94a3b8] uppercase mb-1">Hours</div>
              <div className="font-mono text-sm inline-block bg-gradient-to-r from-[#00d4ff] to-[#00ff88] bg-clip-text text-transparent">{selectedPlayer.hours}</div>
            </div>
            <div className="bg-[#1e1e2e] rounded p-2 text-center border border-white/5">
              <div className="text-[10px] text-[#94a3b8] uppercase mb-1">Win Rate</div>
              <div className="font-mono text-sm text-[#00ff88]">{selectedPlayer.winRate}</div>
            </div>
          </div>

          <div className="flex justify-between items-end mt-2">
            <p className="text-xs text-[#64748b] leading-tight">
              Behavioral profile cached.<br/>Adjust sliders to fine-tune.
            </p>
            <button 
              onClick={onEditSliders}
              className="text-xs font-orbitron text-[#00d4ff] hover:text-white transition-colors"
            >
              VIEW SLIDERS →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main PlayerForm Component ───
export default function PlayerForm({ onSubmit, isLoading }) {
  const [activeMode, setActiveMode] = useState('manual');
  const [values, setValues] = useState(DEFAULT_VALUES);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [showToast, setShowToast] = useState(false);

  const handleSliderChange = (key, val) => {
    setValues(prev => ({ ...prev, [key]: val }));
  };

  const handleSelectPlayer = (player) => {
    setSelectedPlayer(player);

    const seededRandom = (seedStr) => {
      let hash = 0;
      for (let i = 0; i < seedStr.length; i++) {
        hash = seedStr.charCodeAt(i) + ((hash << 5) - hash);
      }
      return () => {
        const t = hash += 0x6D2B79F5;
        let a = t ^ t >>> 15;
        let b = t ^ t >>> 18;
        let c = a ^ b ^ t;
        return ((c ^ c >>> 14) >>> 0) / 4294967296;
      };
    };

    const rng = seededRandom(player.riotId);
    const randomizedValues = { ...player.presetValues };
    
    Object.keys(randomizedValues).forEach(key => {
      if(SLIDER_CONFIG[key]) {
        const range = SLIDER_CONFIG[key].max - SLIDER_CONFIG[key].min;
        const noise = (rng() - 0.5) * 0.1 * range;
        let newVal = randomizedValues[key] + noise;
        newVal = Math.max(SLIDER_CONFIG[key].min, Math.min(SLIDER_CONFIG[key].max, newVal));
        const inv = 1.0 / SLIDER_CONFIG[key].step;
        randomizedValues[key] = Math.round(newVal * inv) / inv;
      }
    });

    setValues(randomizedValues);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  };

  return (
    <div className="flex flex-col h-full bg-[#12121a] p-5 relative">
      {/* Toast Notification */}
      {showToast && (
        <div className="absolute top-2 left-1/2 -translate-x-1/2 z-50 bg-[#00ff88]/10 border border-[#00ff88] text-[#00ff88] px-4 py-1 rounded-full text-xs font-orbitron font-bold tracking-wider shadow-[0_0_15px_#00ff8844] animate-in slide-in-from-top-4 fade-in duration-300">
          PROFILE CACHED & LOADED
        </div>
      )}

      {/* Mode Toggle */}
      <ModeToggle activeMode={activeMode} onToggle={setActiveMode} />

      {/* Main Content Area — Scrollable */}
      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar pb-6 space-y-6">
        
        {activeMode === 'manual' ? (
           <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            {Object.entries(SECTIONS).map(([sectionKey, { label, icon }]) => (
              <div key={sectionKey} className="mb-8 last:mb-0">
                <h3 className="text-xs font-orbitron font-bold text-[#00ff88] tracking-widest uppercase mb-4 flex items-center gap-2 border-b border-[#1e1e2e] pb-2">
                  <span>{icon}</span>
                  {label}
                </h3>
                {Object.entries(SLIDER_CONFIG)
                  .filter(([_, cfg]) => cfg.section === sectionKey)
                  .map(([id, config]) => (
                    <SliderInput
                      key={id}
                      id={id}
                      config={config}
                      value={values[id]}
                      onChange={handleSliderChange}
                    />
                  ))}
              </div>
            ))}
          </div>
        ) : (
          <RiotSearch
            onSelectPlayer={handleSelectPlayer}
            selectedPlayer={selectedPlayer}
            onEditSliders={() => setActiveMode('manual')}
          />
        )}
      </div>

      {/* Sticky Action Button at Bottom */}
      <div className="pt-4 border-t border-[#1e1e2e] bg-[#12121a]">
        <button
          onClick={() => onSubmit(values)}
          disabled={isLoading}
          className="w-full py-4 rounded-xl font-orbitron font-bold text-sm tracking-widest uppercase text-[#0a0a0f] transition-all duration-300 relative overflow-hidden group shadow-[0_0_20px_#00d4ff66] disabled:opacity-50"
          style={{
            background: 'linear-gradient(90deg, #00ff88, #00d4ff)',
          }}
        >
          <span className="relative z-10 flex items-center justify-center gap-2">
            {isLoading ? 'ANALYZING NEURAL PATTERNS...' : '⚡ ANALYZE PLAYER'}
          </span>
          <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
        </button>
      </div>
    </div>
  );
}
