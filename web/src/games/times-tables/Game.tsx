import { useEffect, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { TimesTablesState } from "./state.js";
import { isTerminal } from "./state.js";
import type { timesTablesSettings } from "./index.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import "./Game.css";

type TimesTablesSettingsType = SettingsOf<typeof timesTablesSettings>;

export function TimesTablesGame({ state, dispatch, onGameOver }: GameProps<TimesTablesState, TimesTablesSettingsType>): JSX.Element {
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
      <div className="tt-wrap">
        <div className="tt-done bounce-in">
          <h2>Finished!</h2>
          <p>Score: <strong>{terminal.score}</strong> &middot; {state.correctCount}/{total} correct</p>
        </div>
      </div>
    );
  }

  return (
    <div className="tt-wrap fade-in">
      <div className="tt-header">
        <span>Question <strong>{state.currentIndex + 1}</strong>/{total}</span>
        <span>Score: <strong>{state.score}</strong></span>
        <span>Correct: <strong>{state.correctCount}</strong></span>
      </div>

      <div className="tt-progress-bar">
        <div className="tt-progress-fill" style={{ width: `${pct}%` }} />
      </div>

      <div className="tt-problem">{q.a} &times; {q.b} = ?</div>

      {state.lastResult && (
        <div className={`tt-feedback ${state.lastResult}`}>
          {state.lastResult === "correct" ? "Correct! +10" : `Wrong! Answer was ${state.questions[state.currentIndex - 1]?.answer ?? ""}`}
        </div>
      )}

      <form className="tt-form" onSubmit={e => { e.preventDefault(); dispatch({ type: "submit" }); }}>
        <input
          ref={inputRef}
          className="tt-input"
          type="text"
          inputMode="numeric"
          value={state.typed}
          onChange={e => dispatch({ type: "type", text: e.target.value })}
          placeholder="Answer"
          autoComplete="off"
        />
        <button data-testid="hint-target-times-tables-primary" type="submit" className="tt-btn">Enter</button>
      </form>
    </div>
  );
}
