import { useEffect, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { PrimeFactorState } from "./state.js";
import { isTerminal } from "./state.js";
import type { primeFactorSettings } from "./index.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import "./Game.css";

type PrimeFactorSettingsType = SettingsOf<typeof primeFactorSettings>;

export function PrimeFactorGame({ state, dispatch, onGameOver }: GameProps<PrimeFactorState, PrimeFactorSettingsType>): JSX.Element {
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
      <div className="pf-wrap">
        <div className="pf-done">
          <h2>Finished!</h2>
          <p>Score: <strong>{terminal.score}</strong> &middot; {state.correctCount}/{total} correct</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pf-wrap">
      <div className="pf-header">
        <span>Question <strong>{state.currentIndex + 1}</strong>/{total}</span>
        <span>Score: <strong>{state.score}</strong></span>
        <span>Correct: <strong>{state.correctCount}</strong></span>
      </div>

      <div className="pf-progress-bar">
        <div className="pf-progress-fill" style={{ width: `${pct}%` }} />
      </div>

      <div className="pf-problem">{q.number}</div>
      <div className="pf-label">What is the smallest prime factor?</div>

      {state.lastResult && (
        <div className={`pf-feedback ${state.lastResult}`}>
          {state.lastResult === "correct" ? "Correct! +10" : `Wrong! Smallest prime factor was ${state.questions[state.currentIndex - 1]?.answer ?? ""}`}
        </div>
      )}

      <form className="pf-form" onSubmit={e => { e.preventDefault(); dispatch({ type: "submit" }); }}>
        <input
          ref={inputRef}
          className="pf-input"
          type="text"
          inputMode="numeric"
          value={state.typed}
          onChange={e => dispatch({ type: "type", text: e.target.value })}
          placeholder="Prime"
          autoComplete="off"
        />
        <button data-testid="hint-target-prime-factor-primary" type="submit" className="pf-btn">Enter</button>
      </form>
    </div>
  );
}
