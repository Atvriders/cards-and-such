import { useEffect, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { PercentCalculatorState } from "./state.js";
import { isTerminal } from "./state.js";
import type { percentCalculatorSettings } from "./index.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import "./Game.css";

type PercentCalculatorSettingsType = SettingsOf<typeof percentCalculatorSettings>;

export function PercentCalculatorGame({ state, dispatch, onGameOver }: GameProps<PercentCalculatorState, PercentCalculatorSettingsType>): JSX.Element {
  const terminal = isTerminal(state);
  const rafRef = useRef<number | null>(null);
  const lastRef = useRef<number | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (terminal) {
      onGameOver(terminal.score);
      return;
    }
    const tick = (now: number) => {
      if (lastRef.current === null) lastRef.current = now;
      const dt = Math.min((now - lastRef.current) / 1000, 0.1);
      lastRef.current = now;
      dispatch({ type: "tick", dt });
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      lastRef.current = null;
    };
  }, [terminal, dispatch, onGameOver]);

  useEffect(() => {
    inputRef.current?.focus();
  }, [state.currentIndex]);

  const total = state.questions.length;
  const pct = (state.timeLeft / state.totalTime) * 100;
  const q = state.questions[Math.min(state.currentIndex, total - 1)]!;

  if (terminal) {
    return (
      <div className="pc-wrap">
        <div className="pc-done">
          <h2>Time&apos;s Up!</h2>
          <p>Score: <strong>{terminal.score}</strong> &middot; {state.correctCount}/{state.currentIndex} correct</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pc-wrap">
      <div className="pc-header">
        <span>Q <strong>{state.currentIndex + 1}</strong>/{total}</span>
        <span>Score: <strong>{state.score}</strong></span>
        <span>Time: <strong>{Math.ceil(state.timeLeft)}s</strong></span>
      </div>

      <div className="pc-timer-bar">
        <div className="pc-timer-fill" style={{ width: `${pct}%` }} />
      </div>

      <div className="pc-problem">{q.display} = ?</div>

      {state.lastResult && (
        <div className={`pc-feedback ${state.lastResult}`}>
          {state.lastResult === "correct" ? "Correct! +10" : `Wrong! Answer: ${state.questions[state.currentIndex - 1]?.answer ?? ""}`}
        </div>
      )}

      <form className="pc-form" onSubmit={e => { e.preventDefault(); dispatch({ type: "submit" }); }}>
        <input
          ref={inputRef}
          className="pc-input"
          type="text"
          inputMode="decimal"
          value={state.typed}
          onChange={e => dispatch({ type: "type", text: e.target.value })}
          placeholder="Answer"
          autoComplete="off"
        />
        <button type="submit" className="pc-btn">Enter</button>
      </form>
    </div>
  );
}
