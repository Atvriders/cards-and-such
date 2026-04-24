import { useEffect, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DivisionDrillState } from "./state.js";
import { isTerminal } from "./state.js";
import type { divisionDrillSettings } from "./index.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import "./Game.css";

type DivisionDrillSettingsType = SettingsOf<typeof divisionDrillSettings>;

export function DivisionDrillGame({ state, dispatch, onGameOver }: GameProps<DivisionDrillState, DivisionDrillSettingsType>): JSX.Element {
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
      <div className="dd-wrap">
        <div className="dd-done">
          <h2>Finished!</h2>
          <p>Score: <strong>{terminal.score}</strong> &middot; {state.correctCount}/{total} correct</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dd-wrap">
      <div className="dd-header">
        <span>Question <strong>{state.currentIndex + 1}</strong>/{total}</span>
        <span>Score: <strong>{state.score}</strong></span>
        <span>Correct: <strong>{state.correctCount}</strong></span>
      </div>

      <div className="dd-progress-bar">
        <div className="dd-progress-fill" style={{ width: `${pct}%` }} />
      </div>

      <div className="dd-problem">{q.dividend} &divide; {q.divisor} = ?</div>

      {state.lastResult && (
        <div className={`dd-feedback ${state.lastResult}`}>
          {state.lastResult === "correct" ? "Correct! +10" : `Wrong! Answer was ${state.questions[state.currentIndex - 1]?.answer ?? ""}`}
        </div>
      )}

      <form className="dd-form" onSubmit={e => { e.preventDefault(); dispatch({ type: "submit" }); }}>
        <input
          ref={inputRef}
          className="dd-input"
          type="text"
          inputMode="numeric"
          value={state.typed}
          onChange={e => dispatch({ type: "type", text: e.target.value })}
          placeholder="Answer"
          autoComplete="off"
        />
        <button type="submit" className="dd-btn">Enter</button>
      </form>
    </div>
  );
}
