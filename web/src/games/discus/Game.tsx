import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DiscusState, DiscusSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

export function Discus({ state, dispatch, onGameOver }: GameProps<DiscusState, DiscusSettings>): JSX.Element {
  const terminal = isTerminal(state);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  const lastIsFoul = state.lastResult.startsWith("FOUL");
  const windDir = state.wind > 0.2 ? "→ tailwind" : state.wind < -0.2 ? "← headwind" : "calm";

  return (
    <div className="dsc-game">
      <div className="dsc-title">Discus Throw</div>

      <div className="dsc-scoreboard">
        <span>Best: {state.bestDistance > 0 ? `${state.bestDistance.toFixed(1)}m` : "–"}</span>
        <span>Throw: {state.throwIndex}/{state.totalThrows}</span>
      </div>

      <div className="dsc-wind">Wind: {windDir} ({Math.abs(state.wind).toFixed(1)} m/s)</div>

      <div className="dsc-sector">
        <div className="dsc-sector-arc" />
        <div className="dsc-disc-indicator">🥏</div>
      </div>

      <div className="dsc-attempts">
        {state.throws.map((t, i) => (
          <div key={i} className={`dsc-chip ${t.foul ? "foul" : "throw"}`}>
            {t.foul ? "FOUL" : `${t.distance.toFixed(1)}m`}
          </div>
        ))}
        {Array.from({ length: state.totalThrows - state.throws.length }, (_, i) => (
          <div key={`e-${i}`} className="dsc-chip empty">–</div>
        ))}
      </div>

      {state.phase === "aim" && (
        <div className="dsc-controls">
          <label>
            Spin speed: {Math.round(state.spin * 100)}%
            <input type="range" min={0} max={1} step={0.01} value={state.spin}
              onChange={(e) => dispatch({ type: "set-spin", value: parseFloat(e.target.value) })} />
          </label>
          <label>
            Release angle: {state.angle < 0.35 ? "Too low" : state.angle > 0.65 ? "Too high" : "Optimal"}
            <input type="range" min={0} max={1} step={0.01} value={state.angle}
              onChange={(e) => dispatch({ type: "set-angle", value: parseFloat(e.target.value) })} />
          </label>
          <label>
            Release point: {state.release > 0.92 ? "FOUL RISK!" : state.release > 0.7 ? "Good exit" : "Early release"}
            <input type="range" min={0} max={1} step={0.01} value={state.release}
              onChange={(e) => dispatch({ type: "set-release", value: parseFloat(e.target.value) })} />
          </label>
          <button data-testid="hint-target-discus-action" className="dsc-btn" onClick={() => dispatch({ type: "throw" })}>Throw!</button>
        </div>
      )}

      {state.phase === "result" && (
        <div className={`dsc-result ${lastIsFoul ? "foul" : "good"}`}>
          {state.lastResult}
          <button className="dsc-btn" onClick={() => dispatch({ type: "next" })}>Next Throw</button>
        </div>
      )}

      {state.phase === "done" && (
        <div className="dsc-game-over">
          Best: {state.bestDistance > 0 ? `${state.bestDistance.toFixed(1)}m` : "All fouls!"}<br />
          {state.bestDistance >= 60 ? "Olympic standard!" : state.bestDistance >= 45 ? "Strong throw!" : "Keep spinning!"}
          <br />Score: {terminal?.score ?? 0}
        </div>
      )}
    </div>
  );
}
