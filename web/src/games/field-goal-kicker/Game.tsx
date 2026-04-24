import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { FieldGoalState, FieldGoalAction, FieldGoalSettings } from "./state.js";
import { isTerminal, } from "./state.js";
import "./Game.css";

export function FieldGoalKicker({ state, dispatch, onGameOver }: GameProps<FieldGoalState, FieldGoalSettings>): JSX.Element {
  const terminal = isTerminal(state);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  const pct = state.kickIndex > 0 ? Math.round((state.goodCount / state.kickIndex) * 100) : 0;
  const windDir = state.wind > 0.03 ? `→ ${Math.round(state.wind * 100)}%` : state.wind < -0.03 ? `← ${Math.round(Math.abs(state.wind) * 100)}%` : "Calm";

  return (
    <div className="fg-game">
      <div className="fg-title">Field Goal Kicker</div>

      <div className="fg-stats">
        <span>Made: {state.goodCount}/{state.kickIndex}</span>
        <span>Success: {state.kickIndex > 0 ? pct : "–"}%</span>
        <span>Kicks left: {state.totalKicks - state.kickIndex}</span>
      </div>

      {/* History */}
      <div className="fg-history">
        {state.kicks.map((k, i) => (
          <div key={i} className={`fg-result-dot ${k.good ? "good" : "miss"}`} title={`${k.distance} yds — ${k.good ? "Good" : "No Good"}`}>
            {k.good ? "✓" : "✗"}
          </div>
        ))}
        {Array.from({ length: state.totalKicks - state.kicks.length }, (_, i) => (
          <div key={`e${i}`} className="fg-result-dot empty">○</div>
        ))}
      </div>

      {state.phase === "aim" && (
        <div className="fg-aim">
          <div className="fg-kick-info">
            <span>Distance: <strong>{state.currentDistance} yds</strong></span>
            <span>Wind: <strong>{windDir}</strong></span>
          </div>
          <label>
            Aim angle (center=ideal): {Math.round((state.angle - 0.5) * 200)}%
            <input type="range" min={0} max={1} step={0.01} value={state.angle}
              onChange={(e) => dispatch({ type: "set-angle", value: parseFloat(e.target.value) })} />
          </label>
          <label>
            Power: {Math.round(state.power * 100)}% (ideal≈{Math.round((0.35 + ((state.currentDistance - 20) / 35) * 0.6) * 100)}%)
            <input type="range" min={0} max={1} step={0.01} value={state.power}
              onChange={(e) => dispatch({ type: "set-power", value: parseFloat(e.target.value) })} />
          </label>
          <button className="fg-btn" onClick={() => dispatch({ type: "kick" })}>Kick!</button>
        </div>
      )}

      {state.phase === "result" && (
        <div className={`fg-shot-result ${state.lastResult.startsWith("GOOD") ? "good" : "miss"}`}>
          {state.lastResult}
          <button className="fg-btn" style={{ marginTop: "0.5rem" }} onClick={() => dispatch({ type: "next" })}>Next Kick</button>
        </div>
      )}

      {state.phase === "done" && (
        <div className="fg-game-over">
          {state.goodCount}/{state.totalKicks} ({pct}%)<br />
          {pct >= 80 ? "Pro Kicker!" : pct >= 60 ? "Solid session" : "Need more practice"}<br />
          Score: {terminal?.score ?? 0}
        </div>
      )}
    </div>
  );
}
