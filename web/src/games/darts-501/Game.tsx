import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { Darts501State, Darts501Settings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

export function Darts501({ state, dispatch, onGameOver }: GameProps<Darts501State, Darts501Settings>): JSX.Element {
  const terminal = isTerminal(state);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  return (
    <div className="d501-game">
      <div className="d501-title">Darts 501</div>

      <div className="d501-scoreboard">
        <span>Darts: {state.dartsThrown}</span>
        <span>Thrown: {state.startScore - state.remaining} pts</span>
      </div>

      <div className="d501-remaining">{state.remaining}</div>

      {/* Board */}
      <div className="d501-board">
        <div className="d501-ring d501-ring-outer" />
        <div className="d501-ring d501-ring-double" />
        <div className="d501-ring d501-ring-field" />
        <div className="d501-ring d501-ring-triple" />
        <div className="d501-ring d501-ring-25" />
        <div className="d501-ring d501-ring-bull" />
        <div className="d501-aim-dot" style={{ left: `${state.aim * 100}%`, top: `${(1 - state.height) * 100}%` }} />
      </div>

      <div className="d501-history">
        {state.throws.map((t, i) => (
          <div key={i} className={`d501-chip ${t.points === 0 ? "miss" : state.lastResult.startsWith("BUST") && i === state.throws.length - 1 ? "bust" : ""}`}>
            {t.points === 0 ? "Miss" : `${t.points}`}
          </div>
        ))}
      </div>

      {state.phase === "aim" && (
        <div className="d501-controls">
          <label>
            Aim horizontal: {state.aim < 0.4 ? "Left" : state.aim > 0.6 ? "Right" : "Center"}
            <input type="range" min={0} max={1} step={0.01} value={state.aim}
              onChange={(e) => dispatch({ type: "set-aim", value: parseFloat(e.target.value) })} />
          </label>
          <label>
            Aim height: {state.height < 0.4 ? "Low" : state.height > 0.6 ? "High" : "Bull area"}
            <input type="range" min={0} max={1} step={0.01} value={state.height}
              onChange={(e) => dispatch({ type: "set-height", value: parseFloat(e.target.value) })} />
          </label>
          <label>
            Power/Precision: {Math.round(state.power * 100)}%
            <input type="range" min={0} max={1} step={0.01} value={state.power}
              onChange={(e) => dispatch({ type: "set-power", value: parseFloat(e.target.value) })} />
          </label>
          <button data-testid="hint-target-darts-501-action" className="d501-btn" onClick={() => dispatch({ type: "throw" })}>Throw!</button>
        </div>
      )}

      {state.phase === "result" && (
        <div className="d501-result">
          {state.lastResult}
          <button className="d501-btn" onClick={() => dispatch({ type: "next" })}>Next Dart</button>
        </div>
      )}

      {state.phase === "bust" && (
        <div className="d501-bust-panel">
          {state.lastResult}
          <button className="d501-btn" onClick={() => dispatch({ type: "next" })}>Continue</button>
        </div>
      )}

      {state.phase === "done" && (
        <div className="d501-game-over">
          Finished in {state.dartsThrown} darts!<br />
          {state.dartsThrown <= 15 ? "World-class finish!" : state.dartsThrown <= 25 ? "Solid darts!" : "Keep practicing!"}
          <br />Score: {terminal?.score ?? 0}
        </div>
      )}
    </div>
  );
}
