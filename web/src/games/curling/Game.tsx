import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { CurlingState, CurlingSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

export function Curling({ state, dispatch, onGameOver }: GameProps<CurlingState, CurlingSettings>): JSX.Element {
  const terminal = isTerminal(state);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  return (
    <div className="crl-game">
      <div className="crl-title">Curling</div>

      <div className="crl-scoreboard">
        <span>Score: {state.totalScore}</span>
        <span>End: {state.endIndex + 1}/{state.totalEnds}</span>
        <span>Stone: {state.stoneIndex + 1}/{state.stonesPerEnd}</span>
      </div>

      {/* House */}
      <div className="crl-house">
        <div className="crl-ring crl-ring-outer" />
        <div className="crl-ring crl-ring-12" />
        <div className="crl-ring crl-ring-8" />
        <div className="crl-ring crl-ring-button" />
        {state.stones.slice(-8).map((s, i) => (
          <div key={i} className="crl-stone"
            style={{ left: `${s.finalX * 100}%`, top: `${(1 - s.finalY) * 80 + 10}%` }} />
        ))}
      </div>

      {state.phase === "aim" && (
        <div className="crl-controls">
          <label>
            Weight: {state.weight < 0.5 ? "Light (short)" : state.weight > 0.75 ? "Heavy (through)" : "Draw weight"}
            <input type="range" min={0} max={1} step={0.01} value={state.weight}
              onChange={(e) => dispatch({ type: "set-weight", value: parseFloat(e.target.value) })} />
          </label>
          <label>
            Delivery line: {state.line < 0.4 ? "Left" : state.line > 0.6 ? "Right" : "Center"}
            <input type="range" min={0} max={1} step={0.01} value={state.line}
              onChange={(e) => dispatch({ type: "set-line", value: parseFloat(e.target.value) })} />
          </label>
          <label>
            Sweeping: {state.sweep < 0.3 ? "None" : state.sweep > 0.7 ? "Hard sweep" : "Moderate"}
            <input type="range" min={0} max={1} step={0.01} value={state.sweep}
              onChange={(e) => dispatch({ type: "set-sweep", value: parseFloat(e.target.value) })} />
          </label>
          <button className="crl-btn" onClick={() => dispatch({ type: "throw" })}>Throw!</button>
        </div>
      )}

      {state.phase === "result" && (
        <div className="crl-result">
          {state.lastResult}
          <button className="crl-btn" onClick={() => dispatch({ type: "next" })}>Next Stone</button>
        </div>
      )}

      {state.phase === "done" && (
        <div className="crl-game-over">
          Total score: {state.totalScore} pts<br />
          {state.totalScore >= 20 ? "Curling champion!" : state.totalScore >= 12 ? "Solid sheet!" : state.totalScore >= 6 ? "Good effort!" : "Needs sweeping practice."}
          <br />Score: {terminal?.score ?? 0}
        </div>
      )}
    </div>
  );
}
