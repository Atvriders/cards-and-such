import { useEffect, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { AlgebraSolveXState } from "./state.js";
import { isTerminal } from "./state.js";
import type { algebraSolveXSettings } from "./index.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import "./Game.css";

type AlgebraSolveXSettingsType = SettingsOf<typeof algebraSolveXSettings>;

export function AlgebraSolveXGame({ state, dispatch, onGameOver }: GameProps<AlgebraSolveXState, AlgebraSolveXSettingsType>): JSX.Element {
  const terminal = isTerminal(state);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  useEffect(() => {
    inputRef.current?.focus();
  }, [state.currentIndex]);

  const total = state.questions.length;
  const done = Math.min(state.currentIndex, total);
  const pct = (done / total) * 100;
  const q = state.questions[Math.min(state.currentIndex, total - 1)]!;

  if (terminal) {
    return (
      <div className="ax-wrap">
        <div className="ax-done">
          <h2>Finished!</h2>
          <p>Score: <strong>{terminal.score}</strong> &middot; {state.correctCount}/{total} correct</p>
        </div>
      </div>
    );
  }

  return (
    <div className="ax-wrap">
      <div className="ax-header">
        <span>Question <strong>{state.currentIndex + 1}</strong>/{total}</span>
        <span>Score: <strong>{state.score}</strong></span>
        <span>Correct: <strong>{state.correctCount}</strong></span>
      </div>

      <div className="ax-progress-bar">
        <div className="ax-progress-fill" style={{ width: `${pct}%` }} />
      </div>

      <div className="ax-problem">{q.display}</div>
      <div className="ax-label">Solve for x (x is a positive integer)</div>

      {state.lastResult && (
        <div className={`ax-feedback ${state.lastResult}`}>
          {state.lastResult === "correct" ? "Correct! +10" : `Wrong! x = ${state.questions[state.currentIndex - 1]?.x ?? ""}`}
        </div>
      )}

      <form className="ax-form" onSubmit={e => { e.preventDefault(); dispatch({ type: "submit" }); }}>
        <input
          ref={inputRef}
          className="ax-input"
          type="text"
          inputMode="numeric"
          value={state.typed}
          onChange={e => dispatch({ type: "type", text: e.target.value })}
          placeholder="x = ?"
          autoComplete="off"
        />
        <button type="submit" className="ax-btn">Enter</button>
      </form>
    </div>
  );
}
