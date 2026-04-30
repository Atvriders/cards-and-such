import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { LightsOutMiniState, LightsOutMiniAction, LightsOutMiniSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

export function LightsOutMiniGame({ state, dispatch, onGameOver }: GameProps<LightsOutMiniState, LightsOutMiniSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);

  if (state.phase === "done") {
    return (
      <div className="lom-wrap">
        <div className="lom-banner">
          <h2 className="lom-title">All Off!</h2>
          <div className="lom-stat">Moves: <b>{state.moves}</b></div>
          <div className="lom-final">{t?.score} pts</div>
          <button className="lom-btn primary" onClick={() => dispatch({ type: "reset" } as LightsOutMiniAction)}>
            Play Again
          </button>
        </div>
      </div>
    );
  }

  const onCount = state.cells.filter(Boolean).length;
  return (
    <div className="lom-wrap">
      <div className="lom-info">Tap a cell to flip it and its orthogonal neighbours. Turn every light off.</div>
      <div className="lom-bar">
        <div className="lom-stat">Moves: <b>{state.moves}</b></div>
        <div className="lom-stat">Lit: <b>{onCount} / 9</b></div>
        <button className="lom-btn small" onClick={() => dispatch({ type: "reset" } as LightsOutMiniAction)}>New Board</button>
      </div>
      <div className="lom-grid">
        {state.cells.map((on, i) => (
          <button
            key={i}
            className={`lom-cell${on ? " on" : ""}`}
            onClick={() => dispatch({ type: "tap", index: i } as LightsOutMiniAction)}
            aria-label={on ? "on" : "off"}
          />
        ))}
      </div>
    </div>
  );
}
