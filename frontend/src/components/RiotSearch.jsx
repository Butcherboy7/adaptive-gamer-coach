/**
 * RiotSearch.jsx — Phase 2 Component
 * Allows user to enter Riot ID#Tag → auto-fills gaming behavior sliders
 * Mental health fields still require self-report.
 */

import { useState } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../constants';

const FIELD_LABELS = {
  daily_gaming_hours: 'Daily Gaming Hours',
  weekly_sessions: 'Weekly Sessions',
  night_gaming_ratio: 'Night Gaming Ratio',
};

export default function RiotSearch({ onPrefill }) {
  const [riotId, setRiotId] = useState('');
  const [tagLine, setTagLine] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [insights, setInsights] = useState(null);

  const handleFetch = async () => {
    if (!riotId.trim() || !tagLine.trim()) {
      setError('Enter both your Riot name and tag (e.g. PlayerName + NA1)');
      return;
    }
    setLoading(true);
    setError(null);
    setInsights(null);

    try {
      const resp = await axios.post(`${API_BASE_URL}/fetch-player`, {
        riot_id: riotId.trim(),
        tag_line: tagLine.trim(),
      }, { timeout: 20000 });

      const data = resp.data;
      setInsights(data.riot_insights);

      // Pass auto-filled values up to PlayerForm
      if (onPrefill && data.auto_filled) {
        onPrefill(data.auto_filled);
      }
    } catch (err) {
      if (err.response?.status === 404) {
        setError(`Player "${riotId}#${tagLine}" not found. Check spelling.`);
      } else if (err.response?.status === 403) {
        setError('Riot API key is invalid or expired. Set RIOT_API_KEY in backend/.env');
      } else if (err.response?.status === 400) {
        setError('Missing API key — add RIOT_API_KEY to backend/.env');
      } else if (err.code === 'ERR_NETWORK') {
        setError('Backend unreachable. Make sure FastAPI is running on port 8000.');
      } else {
        setError(err.response?.data?.detail || 'Failed to fetch Riot data.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mb-5 rounded-xl overflow-hidden"
      style={{ border: '1px solid #7c3aed44', background: '#0d0d1a' }}>

      {/* Header */}
      <div className="px-4 py-3 flex items-center gap-2"
        style={{ background: '#7c3aed18', borderBottom: '1px solid #7c3aed33' }}>
        <span className="text-lg">⚔️</span>
        <div>
          <p className="font-orbitron text-xs font-bold" style={{ color: '#7c3aed' }}>
            RIOT AUTOFILL — PHASE 2
          </p>
          <p className="text-[10px] text-[#64748b]">
            Enter your Riot ID to auto-fill gaming stats from match history
          </p>
        </div>
      </div>

      {/* Input row */}
      <div className="p-4">
        <div className="flex gap-2 mb-3">
          {/* Riot Name */}
          <input
            id="riot-name-input"
            type="text"
            placeholder="PlayerName"
            value={riotId}
            onChange={e => setRiotId(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleFetch()}
            className="flex-1 rounded-lg px-3 py-2 text-sm font-mono outline-none transition-all"
            style={{
              background: '#12121a',
              border: '1px solid #1e1e2e',
              color: '#e2e8f0',
            }}
          />
          {/* Tag */}
          <div className="flex items-center gap-1">
            <span className="text-[#64748b] font-bold">#</span>
            <input
              id="riot-tag-input"
              type="text"
              placeholder="NA1"
              value={tagLine}
              onChange={e => setTagLine(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleFetch()}
              className="w-20 rounded-lg px-3 py-2 text-sm font-mono outline-none"
              style={{
                background: '#12121a',
                border: '1px solid #1e1e2e',
                color: '#e2e8f0',
              }}
            />
          </div>
          {/* Fetch button */}
          <button
            id="riot-fetch-btn"
            onClick={handleFetch}
            disabled={loading}
            className="px-4 py-2 rounded-lg text-xs font-orbitron font-bold transition-all"
            style={{
              background: loading ? '#7c3aed44' : '#7c3aed',
              color: loading ? '#7c3aed99' : '#fff',
              cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: loading ? 'none' : '0 0 12px #7c3aed66',
            }}
          >
            {loading ? '...' : 'FETCH'}
          </button>
        </div>

        {/* Error */}
        {error && (
          <p className="text-xs px-2 py-1.5 rounded mb-3"
            style={{ color: '#ff2d55', background: '#ff2d5511', border: '1px solid #ff2d5533' }}>
            ⚠ {error}
          </p>
        )}

        {/* Insights panel */}
        {insights && (
          <div className="rounded-lg p-3 mt-1"
            style={{ background: '#0a0a0f', border: '1px solid #1e1e2e' }}>

            {/* Rage signal banner */}
            {insights.rage_signal_detected && (
              <div className="mb-3 px-3 py-2 rounded-lg flex items-center gap-2"
                style={{ background: '#ff2d5511', border: '1px solid #ff2d5544' }}>
                <span>🚨</span>
                <p className="text-xs font-semibold" style={{ color: '#ff2d55' }}>
                  Rage signal detected — surrendered in {Math.round(insights.surrender_rate * 100)}% of recent matches
                </p>
              </div>
            )}

            {/* Stats grid */}
            <div className="grid grid-cols-2 gap-2 mb-3">
              {[
                ['Matches Analyzed', insights.total_matches],
                ['Surrendered', insights.surrendered_matches],
                ['Avg KDA', insights.average_kda],
                ['Night Sessions', insights.night_sessions],
              ].map(([label, value]) => (
                <div key={label} className="rounded px-2 py-1.5"
                  style={{ background: '#12121a' }}>
                  <p className="text-[10px] text-[#64748b]">{label}</p>
                  <p className="text-sm font-bold font-mono" style={{ color: '#00d4ff' }}>{value}</p>
                </div>
              ))}
            </div>

            {/* Prefilled fields */}
            <div>
              <p className="text-[10px] text-[#64748b] mb-1.5 font-semibold uppercase tracking-wider">
                ✅ Auto-filled into sliders:
              </p>
              <div className="flex flex-col gap-1">
                {Object.entries(FIELD_LABELS).map(([key, label]) => (
                  <div key={key} className="flex justify-between items-center px-2 py-1 rounded"
                    style={{ background: '#00ff8811' }}>
                    <span className="text-[11px]" style={{ color: '#e2e8f0' }}>{label}</span>
                    <span className="text-xs font-mono font-bold" style={{ color: '#00ff88' }}>
                      computed ✓
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <p className="text-[10px] text-[#64748b] mt-3">
              ⚠ Mental health fields below still require self-report — Riot API cannot access them.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
