import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { GameDevState, GameDevAction, Genre } from "./state.js";
import { isTerminal, TOTAL_MONTHS, GENRES } from "./state.js";
import "./Game.css";

export function GameDevStudio({
  state,
  dispatch,
  onGameOver,
}: GameProps<GameDevState, Record<string, never>>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  const d = (a: GameDevAction) => dispatch(a);
  const genreInfo = GENRES[state.genre];
  const qualityPct = Math.min(100, Math.round((state.qualityPoints / genreInfo.qualityNeeded) * 100));
  const devCostEstimate = state.teamSize * 200 + state.marketingBudget + (state.qualityFocus ? 100 : 0);
  const canLaunch = state.monthsInDev >= 1;

  return (
    <div className="gds-wrap">
      <div className="gds-header">
        <span className="gds-title">🎮 Game Dev Studio</span>
        <span className="gds-month">Month {state.month}/{TOTAL_MONTHS}</span>
        <span className="gds-cash">${state.cash}</span>
      </div>

      <div className="gds-project">
        <div>In Dev: <strong>"{state.currentProject}"</strong> ({genreInfo.label})</div>
        <div style={{ fontSize: "0.8rem", marginTop: 2 }}>
          Quality: {state.qualityPoints}/{genreInfo.qualityNeeded} ({qualityPct}%)
        </div>
        <div className="gds-progress">
          <div className="gds-progress-bar" style={{ width: `${qualityPct}%` }} />
        </div>
        <div style={{ fontSize: "0.8rem", marginTop: 4 }}>Hype: {state.hype}%</div>
        <div className="gds-hype-bar">
          <div className="gds-hype-fill" style={{ width: `${state.hype}%` }} />
        </div>
      </div>

      <div className="gds-stats">
        <div className="gds-badge">Team: {state.teamSize} devs</div>
        <div className="gds-badge">Released: {state.gamesReleased}</div>
        <div className="gds-badge">Dev months: {state.monthsInDev}</div>
      </div>

      {state.phase === "plan" && (
        <div className="gds-plan">
          <label>
            Team Size: <strong>{state.teamSize} devs</strong> (${state.teamSize * 200}/month)
            <input type="range" min={1} max={8} step={1} value={state.teamSize}
              onChange={e => d({ type: "setTeam", value: +e.target.value })} />
          </label>
          <label>
            Marketing: <strong>${state.marketingBudget}/month</strong>
            <input type="range" min={0} max={300} step={25} value={state.marketingBudget}
              onChange={e => d({ type: "setMarketing", value: +e.target.value })} />
          </label>
          <div>
            <div style={{ fontSize: "0.85rem", marginBottom: 6, color: "#e2e8f0" }}>Genre (locked after dev starts):</div>
            <div className="gds-genres">
              {(Object.keys(GENRES) as Genre[]).map(g => (
                <button key={g}
                  className={`gds-genre-btn${state.genre === g ? " active" : ""}`}
                  disabled={state.monthsInDev > 0}
                  onClick={() => d({ type: "setGenre", value: g })}>
                  {GENRES[g].label}
                </button>
              ))}
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <button
              className={`gds-qc-btn${state.qualityFocus ? " active" : ""}`}
              onClick={() => d({ type: "toggleQuality" })}>
              {state.qualityFocus ? "✓ Quality Focus ($100/mo extra)" : "Quality Focus (+$100/mo)"}
            </button>
          </div>
          <div style={{ fontSize: "0.82rem", color: "#a0aec0" }}>
            Monthly burn: ~${devCostEstimate} | Cash: ${state.cash}
          </div>
          <div className="gds-actions">
            <button className="gds-btn" onClick={() => d({ type: "devMonth" })}>Dev Month</button>
            {canLaunch && (
              <button className="gds-btn launch" onClick={() => d({ type: "launch" })}>
                🚀 Launch!
              </button>
            )}
          </div>
        </div>
      )}

      {state.phase === "results" && (
        <div className="gds-results">
          {state.lastRelease ? (
            <div className="gds-launch-box">
              <div className="gds-launch-title">🚀 "{state.lastRelease.title}" LAUNCHED!</div>
              <div>Review Score: {state.lastRelease.score}/100</div>
              <div>Copies Sold: {state.lastRelease.sales.toLocaleString()}</div>
              <div>Revenue: ${state.lastRelease.revenue.toLocaleString()}</div>
            </div>
          ) : (
            <div className="gds-result-row">Development continues — quality building...</div>
          )}
          <div className="gds-result-row">Monthly cost: ${state.lastCost}</div>
          <button className="gds-btn" style={{ marginTop: 4 }} onClick={() => d({ type: "nextMonth" })}>
            {state.month >= TOTAL_MONTHS ? "Exit Studio" : "Next Month →"}
          </button>
        </div>
      )}

      {state.phase === "done" && (
        <div className="gds-done">
          <div className="gds-done-cash">Final Cash: ${state.cash.toLocaleString()}</div>
          <div>{state.gamesReleased} games released</div>
          <div style={{ marginTop: 8 }}>
            {state.cash >= 6000 ? "🏆 AAA Studio!" : state.cash >= 2500 ? "👍 Indie success!" : "📉 Back to jam games"}
          </div>
        </div>
      )}

      {state.log.length > 0 && (
        <div className="gds-log">
          {[...state.log].reverse().map((l, i) => <div key={i} className="gds-log-line">{l}</div>)}
        </div>
      )}
    </div>
  );
}
