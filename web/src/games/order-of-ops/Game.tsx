import { useEffect, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { OrderOfOpsState } from "./state.js";
import { isTerminal } from "./state.js";
import type { orderOfOpsSettings } from "./index.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import "./Game.css";

type OrderOfOpsSettingsType = SettingsOf<typeof orderOfOpsSettings>;

export function OrderOfOpsGame({ state, dispatch, onGameOver }: GameProps<OrderOfOpsState, OrderOfOpsSettingsType>): JSX.Element {
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
      <div className="oo-wrap">
        <div className="oo-done">
          <h2>Finished!</h2>
          <p>Score: <strong>{terminal.score}</strong> &middot; {state.correctCount}/{total} correct</p>
        </div>
      </div>
    );
  }

  return (
    <div className="oo-wrap">
      <div className="oo-header">
        <span>Question <strong>{state.currentIndex + 1}</strong>/{total}</span>
        <span>Score: <strong>{state.score}</strong></span>
        <span>Correct: <strong>{state.correctCount}</strong></span>
      </div>

      <div className="oo-progress-bar">
        <div className="oo-progress-fill" style={{ width: `${pct}%` }} />
      </div>

      <div className="oo-problem">{q.expression} = ?</div>
      <div className="oo-hint">Remember: brackets first, then × and ÷, then + and −</div>

      {state.lastResult && (
        <div className={`oo-feedback ${state.lastResult}`}>
          {state.lastResult === "correct" ? "Correct! +10" : `Wrong! Answer was ${state.questions[state.currentIndex - 1]?.answer ?? ""}`}
        </div>
      )}

      <form className="oo-form" onSubmit={e => { e.preventDefault(); dispatch({ type: "submit" }); }}>
        <input
          ref={inputRef}
          className="oo-input"
          type="text"
          inputMode="numeric"
          value={state.typed}
          onChange={e => dispatch({ type: "type", text: e.target.value })}
          placeholder="Answer"
          autoComplete="off"
        />
        <button type="submit" className="oo-btn">Enter</button>
      </form>
    </div>
  );
}
