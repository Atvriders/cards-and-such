import { useEffect, useState } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { PingPongRallyState, PingPongRallySettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

export function PingPongRally({ state, dispatch, onGameOver }: GameProps<PingPongRallyState, PingPongRallySettings>): JSX.Element {
  const terminal = isTerminal(state);
  const [localTiming, setLocalTiming] = useState(0.5);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  const isMiss = state.lastResult === "Missed!";

  return (
    <div className="ppr-game">
      <div className="ppr-title">Ping Pong Rally</div>

      <div className="ppr-scoreboard">
        <span>Hits: {state.totalHits}/{state.rallyCount}</span>
        <span>Streak: {state.streak}</span>
        <span>Best: {state.longestStreak}</span>
        <span>Left: {state.targetRally - state.rallyCount}</span>
      </div>

      {/* Table visual */}
      <div className="ppr-table">
        <div className="ppr-net" />
        <div className="ppr-window-marker" style={{ left: `${state.hitWindow * 100}%` }} />
        <div className="ppr-ball" style={{ left: `${state.hitWindow * 100}%` }} />
      </div>

      <div className="ppr-hit-bar">
        <div className="ppr-hit-fill" style={{ width: `${state.targetRally > 0 ? (state.totalHits / state.targetRally) * 100 : 0}%` }} />
      </div>

      {state.phase === "rally" && (
        <div className="ppr-controls">
          <div className={`ppr-feedback ${isMiss ? "miss" : ""}`}>{state.lastResult || "Return the ball!"}</div>
          <label>
            Return timing: {Math.round(localTiming * 100)}%
            <input type="range" min={0} max={1} step={0.01} value={localTiming}
              onChange={(e) => setLocalTiming(parseFloat(e.target.value))} />
          </label>
          <button data-testid="hint-target-ping-pong-rally-action" className="ppr-btn" onClick={() => dispatch({ type: "hit", timing: localTiming })}>Hit!</button>
        </div>
      )}

      {state.phase === "miss" && (
        <div className="ppr-miss-panel">
          <div>MISSED — streak reset!</div>
          <button className="ppr-btn" onClick={() => dispatch({ type: "restart" })}>Continue</button>
        </div>
      )}

      {state.phase === "done" && (
        <div className="ppr-game-over">
          {state.totalHits}/{state.targetRally} returns<br />
          Best streak: {state.longestStreak}<br />
          {state.totalHits >= state.targetRally * 0.9 ? "World-class!" : state.totalHits >= state.targetRally * 0.7 ? "Great rally!" : "Keep practicing!"}
          <br />Score: {terminal?.score ?? 0}
        </div>
      )}
    </div>
  );
}
