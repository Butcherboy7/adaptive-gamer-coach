import { useState, useRef, useEffect } from 'react';
import { SLIDER_CONFIG, SECTIONS, DEFAULT_VALUES } from '../constants';

// ─── Tooltip Component ───
function Tooltip({ text, children }) {
  const [show, setShow] = useState(false);
  return (
    <span className="relative inline-block">
      <span
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        onFocus={() => setShow(true)}
        onBlur={() => setShow(false)}
        className="cursor-help"
      >
        {children}
      </span>
      {show && (
        <span className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 px-3 py-2 rounded-lg text-xs text-white bg-[#12121a] border border-[#1e1e2e] shadow-lg pointer-events-none"
          style={{ boxShadow: '0 0 10px #00d4ff44' }}>
          {text}
          <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#1e1e2e]" />
        </span>
      )}
    </span>
  );
}

// ─── Slider value color: green → yellow → red ───
function getValueColor(key, value) {
  const config = SLIDER_CONFIG[key];
  const normalized = (value - config.min) / (config.max - config.min);
  
  // Invert for "good" metrics
  const invertedKeys = ['happiness_score', 'social_interaction_score', 'sleep_hours'];
  const ratio = invertedKeys.includes(key) ? 1 - normalized : normalized;
  
  if (ratio < 0.4) return '#00ff88';
  if (ratio < 0.7) return '#fbbf24';
  return '#ff2d55';
}

// ─── Single Slider ───
function SliderInput({ sliderKey, value, onChange }) {
  const config = SLIDER_CONFIG[sliderKey];
  const color = getValueColor(sliderKey, value);
  const normalized = (value - config.min) / (config.max - config.min);
  
  // Dynamic track gradient
  const trackStyle = {
    background: `linear-gradient(to right, ${color} 0%, ${color} ${normalized * 100}%, #1e1e2e ${normalized * 100}%, #1e1e2e 100%)`
  };

  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-1.5">
        <label className="text-sm font-medium text-[#e2e8f0] flex items-center gap-1.5">
          <Tooltip text={config.tooltip}>
            <span className="flex items-center gap-1">
              {config.label}
              <span className="text-[#64748b] text-xs border border-[#1e1e2e] rounded px-1 hover:border-[#00d4ff] transition-colors">?</span>
            </span>
          </Tooltip>
        </label>
        <span
          className="font-mono text-sm font-bold px-2 py-0.5 rounded border transition-all duration-200"
          style={{
            color: color,
            borderColor: color + '66',
            backgroundColor: color + '11',
            textShadow: `0 0 8px ${color}88`,
            minWidth: '52px',
            textAlign: 'center',
          }}
        >
          {typeof value === 'number' && !Number.isInteger(value) ? value.toFixed(1) : value}
        </span>
      </div>
      <input
        type="range"
        min={config.min}
        max={config.max}
        step={config.step}
        value={value}
        onChange={(e) => onChange(sliderKey, parseFloat(e.target.value))}
        className="w-full h-1 rounded cursor-pointer appearance-none slider-thumb-green"
        style={trackStyle}
        aria-label={config.label}
      />
      <div className="flex justify-between text-xs text-[#64748b] mt-0.5">
        <span>{config.min}</span>
        <span>{config.max}</span>
      </div>
    </div>
  );
}

// ─── Main PlayerForm ───
export default function PlayerForm({ onSubmit, isLoading, prefillValues }) {
  const [values, setValues] = useState(DEFAULT_VALUES);
  const [buttonPulse, setButtonPulse] = useState(false);
  const [prefillFlash, setPrefillFlash] = useState(false);
  const audioRef = useRef(null);

  // When Riot API returns auto-filled values, merge them in with a flash
  useEffect(() => {
    if (prefillValues && Object.keys(prefillValues).length > 0) {
      setValues(prev => ({ ...prev, ...prefillValues }));
      setPrefillFlash(true);
      setTimeout(() => setPrefillFlash(false), 1200);
    }
  }, [prefillValues]);

  const handleChange = (key, val) => {
    setValues(prev => ({ ...prev, [key]: val }));
  };

  const playBeep = () => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
      osc.start();
      osc.stop(ctx.currentTime + 0.2);
    } catch (e) { /* silent fail */ }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setButtonPulse(true);
    playBeep();
    setTimeout(() => setButtonPulse(false), 600);
    onSubmit(values);
  };

  // Group sliders by section
  const grouped = {};
  Object.entries(SLIDER_CONFIG).forEach(([key, config]) => {
    if (!grouped[config.section]) grouped[config.section] = [];
    grouped[config.section].push(key);
  });

  return (
    <form
      onSubmit={handleSubmit}
      className="h-full overflow-y-auto pr-1"
      style={{ scrollbarWidth: 'thin' }}
    >
      {/* Header */}
      <div className="mb-6">
        <h2 className="font-orbitron text-lg font-bold tracking-widest text-[#00d4ff] mb-1"
          style={{ textShadow: '0 0 10px #00d4ff88' }}>
          PLAYER PROFILE
        </h2>
        <p className="text-xs text-[#64748b]">Adjust sliders to match your gaming behavior</p>
      </div>

      {/* Sections */}
      {Object.entries(SECTIONS).map(([sectionKey, section]) => (
        <div key={sectionKey} className="mb-6">
          {/* Section header */}
          <div className="flex items-center gap-2 mb-3 pb-2 border-b border-[#1e1e2e]">
            <span className="text-base">{section.icon}</span>
            <span className="font-rajdhani text-sm font-semibold tracking-widest uppercase text-[#64748b]">
              {section.label}
            </span>
          </div>

          {/* Sliders in this section */}
          {(grouped[sectionKey] || []).map(key => (
            <SliderInput
              key={key}
              sliderKey={key}
              value={values[key]}
              onChange={handleChange}
            />
          ))}
        </div>
      ))}

      {/* Submit button */}
      <button
        type="submit"
        disabled={isLoading}
        className={`
          w-full py-3.5 px-6 rounded-lg font-orbitron text-sm font-bold tracking-widest
          transition-all duration-200 relative overflow-hidden
          ${isLoading ? 'cursor-not-allowed opacity-70' : 'cursor-pointer hover:scale-[1.02] active:scale-[0.98]'}
          ${buttonPulse ? 'scale-[0.97]' : ''}
        `}
        style={{
          background: isLoading
            ? 'linear-gradient(135deg, #1e1e2e, #1e1e2e)'
            : 'linear-gradient(135deg, #00ff88 0%, #00d4ff 100%)',
          color: isLoading ? '#64748b' : '#0a0a0f',
          boxShadow: isLoading ? 'none' : '0 0 20px #00ff8866, 0 0 40px #00d4ff44',
        }}
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.37 0 0 5.37 0 12h4z"/>
            </svg>
            RUNNING MODELS...
          </span>
        ) : (
          'ANALYZE PLAYER'
        )}
      </button>

      {/* Divider with copy button placeholder */}
      <div className="mt-3 text-center">
        <span className="text-xs text-[#64748b]">200k training samples · Random Forest · Gradient Boosting</span>
      </div>
    </form>
  );
}
