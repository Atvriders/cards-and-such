import { useEffect, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { ExponentDrillState } from "./state.js";
import { isTerminal } from "./state.js";
import type { exponentDrillSettings } from "./index.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import "./Game.css";

type ExponentDrillSettingsType = SettingsOf<typeof exponentDrillSettings>;

export function ExponentDrillGame({ state, dispatch, onGameOver }: GameProps<ExponentDrillState, ExponentDrillSettingsType>): JSX.Element {
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
      <div className="ed-wrap">
        <div className="ed-done">
          <h2>Finished!</h2>
          <p>Score: <strong>{terminal.score}</strong> &middot; {state.correctCount}/{total} correct</p>
        </div>
      </div>
    );
  }

  return (
    <div className="ed-wrap">
      <div className="ed-header">
        <span>Question <strong>{state.currentIndex + 1}</strong>/{total}</span>
        <span>Score: <strong>{state.score}</strong></span>
        <span>Correct: <strong>{state.correctCount}</strong></span>
      </div>

      <div className="ed-progress-bar">
        <div className="ed-progress-fill" style={{ width: `${pct}%` }} />
      </div>

      <div className="ed-problem">
        {q.base}<sup>{q.exp}</sup> = ?
      </div>

      {state.lastResult && (
        <div className={`ed-feedback ${state.lastResult}`}>
          {state.lastResult === "correct" ? "Correct! +10" : `Wrong! ${state.questions[state.currentIndex - 1]?.display ?? ""} = ${state.questions[state.currentIndex - 1]?.answer ?? ""}`}
        </div>
      )}

      <form className="ed-form" onSubmit={e => { e.preventDefault(); dispatch({ type: "submit" }); }}>
        <input
          ref={inputRef}
          className="ed-input"
          type="text"
          inputMode="numeric"
          value={state.typed}
          onChange={e => dispatch({ type: "type", text: e.target.value })}
          placeholder="Answer"
          autoComplete="off"
        />
        <button data-testid="hint-target-exponent-drill-primary" type="submit" className="ed-btn">Enter</button>
      </form>
    </div>
  );
}
