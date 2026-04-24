import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { TennisServeState, TennisServeAction, TennisServeSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

const RESULT_EMOJI: Record<string, string> = { ace: "★", in: "✓", fault: "!", "double-fault": "✗" };

export function TennisServe({ state, dispatch, onGameOver }: GameProps<TennisServeState, TennisServeSettings>): JSX.Element {
  const terminal = isTerminal(state);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  const windDir = state.wind > 0.03 ? `→ ${Math.round(state.wind * 100)}%` : state.wind < -0.03 ? `← ${Math.round(Math.abs(state.wind) * 100)}%` : "Calm";

  return (
    <div className="ts-game">
      <div className="ts-title">Tennis Serve</div>

      <div className="ts-stats">
        <span>★ Aces: {state.aceCount}</span>
        <span>Faults: {state.faultCount}</span>
        <span>DFs: {state.doubleFaultCount}</span>
        <span>{state.pointIndex}/{state.totalPoints}</span>
      </div>

      {/* Serve history */}
      <div className="ts-history">
        {state.serves.map((s, i) => (
          <div key={i} className={`ts-dot ts-dot-${s.result}`} title={`${s.result}${s.isSecond ? " (2nd)" : ""}`}>
            {RESULT_EMOJI[s.result]}
          </div>
        ))}
        {Array.from({ length: state.totalPoints - state.pointIndex }, (_, i) => (
          <div key={`e${i}`} className="ts-dot ts-dot-empty">○</div>
        ))}
      </div>

      {state.phase === "aim" && (
        <div className="ts-aim">
          <div className="ts-serve-label">
            {state.isSecondServe ? "SECOND SERVE (safer — 65% power ideal)" : "First Serve (aim for ace — 80% power ideal)"}
          </div>
          <div className="ts-wind">Wind: {windDir}</div>
          <label>
            Angle (center=cross-court): {Math.round((state.angle - 0.5) * 200)}%
            <input type="range" min={0} max={1} step={0.01} value={state.angle}
              onChange={(e) => dispatch({ type: "set-angle", value: parseFloat(e.target.value) })} />
          </label>
          <label>
            Power: {Math.round(state.power * 100)}%
            <input type="range" min={0} max={1} step={0.01} value={state.power}
              onChange={(e) => dispatch({ type: "set-power", value: parseFloat(e.target.value) })} />
          </label>
          <button className="ts-btn" onClick={() => dispatch({ type: "serve" })}>Serve!</button>
        </div>
      )}

      {state.phase === "result" && (
        <div className={`ts-result-box ${state.lastResult.includes("ACE") ? "ace" : state.lastResult.includes("FAULT") ? "fault" : "in"}`}>
          {state.lastResult}
          <button className="ts-btn" onClick={() => dispatch({ type: "next" })}>
            {state.isSecondServe ? "Second Serve" : "Next Point"}
          </button>
        </div>
      )}

      {state.phase === "done" && (
        <div className="ts-game-over">
          Session complete!<br />
          Aces: {state.aceCount} | In: {state.serves.filter((s) => s.result === "in").length} | DFs: {state.doubleFaultCount}<br />
          Score: {terminal?.score ?? 0}
        </div>
      )}
    </div>
  );
}
