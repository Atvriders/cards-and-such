import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { LongJumpState, LongJumpSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

export function LongJump({ state, dispatch, onGameOver }: GameProps<LongJumpState, LongJumpSettings>): JSX.Element {
  const terminal = isTerminal(state);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  const lastIsFoul = state.lastResult.startsWith("FOUL");

  return (
    <div className="lj-game">
      <div className="lj-title">Long Jump</div>

      <div className="lj-scoreboard">
        <span>Best: {state.bestDistance > 0 ? `${state.bestDistance.toFixed(2)}m` : "–"}</span>
        <span>Attempt: {state.attemptIndex}/{state.totalAttempts}</span>
      </div>

      <div className="lj-track">
        <div className="lj-board" />
        <div className="lj-pit" />
        <div className="lj-athlete" style={{ left: `${state.timing * 60 + 5}%` }}>🏃</div>
      </div>

      <div className="lj-attempts">
        {state.attempts.map((a, i) => (
          <div key={i} className={`lj-chip ${a.foul ? "foul" : "jump"}`}>
            {a.foul ? "FOUL" : `${a.distance.toFixed(2)}m`}
          </div>
        ))}
        {Array.from({ length: state.totalAttempts - state.attempts.length }, (_, i) => (
          <div key={`e-${i}`} className="lj-chip empty">–</div>
        ))}
      </div>

      {state.phase === "run" && (
        <div className="lj-controls">
          <label>
            Sprint speed: {Math.round(state.speed * 100)}%
            <input type="range" min={0} max={1} step={0.01} value={state.speed}
              onChange={(e) => dispatch({ type: "set-speed", value: parseFloat(e.target.value) })} />
          </label>
          <label>
            Takeoff angle: {state.angle < 0.35 ? "Too flat" : state.angle > 0.55 ? "Too steep" : "Ideal!"}
            <input type="range" min={0} max={1} step={0.01} value={state.angle}
              onChange={(e) => dispatch({ type: "set-angle", value: parseFloat(e.target.value) })} />
          </label>
          <label>
            Board timing: {state.timing > 0.95 ? "FOUL RISK!" : state.timing > 0.8 ? "At the board" : "Short of board"}
            <input type="range" min={0} max={1} step={0.01} value={state.timing}
              onChange={(e) => dispatch({ type: "set-timing", value: parseFloat(e.target.value) })} />
          </label>
          <button data-testid="hint-target-long-jump-action" className="lj-btn" onClick={() => dispatch({ type: "jump" })}>Jump!</button>
        </div>
      )}

      {state.phase === "result" && (
        <div className={`lj-result ${lastIsFoul ? "foul" : "good"}`}>
          {state.lastResult}
          <button className="lj-btn" onClick={() => dispatch({ type: "next" })}>Next Attempt</button>
        </div>
      )}

      {state.phase === "done" && (
        <div className="lj-game-over">
          Best: {state.bestDistance > 0 ? `${state.bestDistance.toFixed(2)}m` : "All fouls!"}<br />
          {state.bestDistance >= 8.0 ? "Olympic gold!" : state.bestDistance >= 7.0 ? "Great jump!" : state.bestDistance >= 5.5 ? "Decent effort." : "Keep training!"}
          <br />Score: {terminal?.score ?? 0}
        </div>
      )}
    </div>
  );
}
