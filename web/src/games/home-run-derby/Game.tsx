import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { HomeRunDerbyState, HomeRunDerbySettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

export function HomeRunDerby({ state, dispatch, onGameOver }: GameProps<HomeRunDerbyState, HomeRunDerbySettings>): JSX.Element {
  const terminal = isTerminal(state);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  const windDir = state.wind > 0.03 ? "→ out" : state.wind < -0.03 ? "← in" : "calm";
  const lastType = state.lastResult.startsWith("HOME RUN") ? "hr" : state.lastResult.startsWith("OUT") ? "out" : "hit";

  return (
    <div className="hrd-game">
      <div className="hrd-title">Home Run Derby</div>

      <div className="hrd-scoreboard">
        <span className="hr-count">HRs: {state.homeRuns}</span>
        <span>Outs: {state.outsUsed}/{state.maxOuts}</span>
        <span>Swings: {state.swings.length}</span>
      </div>

      <div className="hrd-history">
        {state.swings.map((s, i) => (
          <div key={i} className={`hrd-dot ${s.result}`} title={s.result === "hr" ? `HR ${s.distance}ft` : s.result}>
            {s.result === "hr" ? "HR" : s.result === "hit" ? "H" : "O"}
          </div>
        ))}
      </div>

      {state.phase === "aim" && (
        <div className="hrd-field">
          <div className="hrd-wind">Wind: {windDir} ({Math.abs(state.wind * 100).toFixed(0)}%)</div>
          <label>
            Timing (center=ideal): {Math.round((state.timing - 0.5) * 200)}%
            <input type="range" min={0} max={1} step={0.01} value={state.timing}
              onChange={(e) => dispatch({ type: "set-timing", value: parseFloat(e.target.value) })} />
          </label>
          <label>
            Power: {Math.round(state.power * 100)}%
            <input type="range" min={0} max={1} step={0.01} value={state.power}
              onChange={(e) => dispatch({ type: "set-power", value: parseFloat(e.target.value) })} />
          </label>
          <button className="hrd-btn" onClick={() => dispatch({ type: "swing" })}>Swing!</button>
        </div>
      )}

      {state.phase === "result" && (
        <div className={`hrd-result ${lastType}`}>
          {state.lastResult}
          <button className="hrd-btn" onClick={() => dispatch({ type: "next" })}>Next Pitch</button>
        </div>
      )}

      {state.phase === "done" && (
        <div className="hrd-game-over">
          {state.homeRuns} Home Run{state.homeRuns !== 1 ? "s" : ""}!<br />
          {state.homeRuns >= 10 ? "Derby champion!" : state.homeRuns >= 5 ? "Solid power!" : state.homeRuns >= 2 ? "Keep swinging!" : "Whiff city..."}
          <br />Score: {terminal?.score ?? 0}
        </div>
      )}
    </div>
  );
}
