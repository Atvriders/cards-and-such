import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { BasketballFTState, BasketballFTAction, BasketballFTSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

export function BasketballFT({ state, dispatch, onGameOver }: GameProps<BasketballFTState, BasketballFTSettings>): JSX.Element {
  const terminal = isTerminal(state);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  const pct = state.shotsTaken > 0 ? Math.round((state.madeCount / state.shotsTaken) * 100) : 0;
  const windDir = state.wind > 0.05 ? "→" : state.wind < -0.05 ? "←" : "–";

  return (
    <div className="bft-game">
      <div className="bft-title">Basketball Free Throws</div>

      <div className="bft-scoreboard">
        <span>Made: {state.madeCount}/{state.shotsTaken}</span>
        <span>Shooting %: {state.shotsTaken > 0 ? pct : "–"}%</span>
        <span>Shots left: {state.totalShots - state.shotsTaken}</span>
      </div>

      {/* Shot history dots */}
      <div className="bft-history">
        {state.shots.map((s, i) => (
          <div key={i} className={`bft-dot ${s.made ? "made" : "miss"}`} title={s.made ? "Made" : "Missed"} />
        ))}
        {Array.from({ length: state.totalShots - state.shots.length }, (_, i) => (
          <div key={`empty-${i}`} className="bft-dot empty" />
        ))}
      </div>

      {state.phase === "aim" && (
        <div className="bft-aim">
          {state.distraction && <div className="bft-distraction">Distraction: {state.distraction}</div>}
          <div className="bft-wind">Wind: {windDir} ({Math.abs(state.wind * 100).toFixed(0)}%)</div>
          <label>
            Aim (center=ideal): {Math.round((state.angle - 0.5) * 200)}%
            <input type="range" min={0} max={1} step={0.01} value={state.angle}
              onChange={(e) => dispatch({ type: "set-angle", value: parseFloat(e.target.value) })} />
          </label>
          <label>
            Arc/Power: {Math.round(state.power * 100)}%
            <input type="range" min={0} max={1} step={0.01} value={state.power}
              onChange={(e) => dispatch({ type: "set-power", value: parseFloat(e.target.value) })} />
          </label>
          <button data-testid="hint-target-basketball-free-throws-action" className="bft-btn" onClick={() => dispatch({ type: "shoot" })}>Shoot!</button>
        </div>
      )}

      {state.phase === "result" && (
        <div className={`bft-result ${state.lastResult === "MADE IT!" ? "made" : "miss"}`}>
          {state.lastResult}
          <button className="bft-btn" onClick={() => dispatch({ type: "next" })}>Next Shot</button>
        </div>
      )}

      {state.phase === "done" && (
        <div className="bft-game-over">
          {state.madeCount}/{state.totalShots} ({pct}%)<br />
          {pct >= 90 ? "Elite shooter!" : pct >= 70 ? "Good session!" : pct >= 50 ? "Average." : "Keep practicing!"}
          <br />Score: {terminal?.score ?? 0}
        </div>
      )}
    </div>
  );
}
