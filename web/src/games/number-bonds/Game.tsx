import { useEffect, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { NumberBondsState } from "./state.js";
import { isTerminal } from "./state.js";
import type { numberBondsSettings } from "./index.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import "./Game.css";

type NumberBondsSettingsType = SettingsOf<typeof numberBondsSettings>;

export function NumberBondsGame({ state, dispatch, onGameOver }: GameProps<NumberBondsState, NumberBondsSettingsType>): JSX.Element {
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
  const prevQ = state.questions[state.currentIndex - 1];

  if (terminal) {
    return (
      <div className="nb-wrap">
        <div className="nb-done">
          <h2>Finished!</h2>
          <p>Score: <strong>{terminal.score}</strong> &middot; {state.correctCount}/{total} correct</p>
        </div>
      </div>
    );
  }

  return (
    <div className="nb-wrap">
      <div className="nb-header">
        <span>Question <strong>{state.currentIndex + 1}</strong>/{total}</span>
        <span>Score: <strong>{state.score}</strong></span>
        <span>Correct: <strong>{state.correctCount}</strong></span>
      </div>

      <div className="nb-progress-bar">
        <div className="nb-progress-fill" style={{ width: `${pct}%` }} />
      </div>

      <div className="nb-bond">
        <div className="nb-target">{q.target}</div>
        <div className="nb-row">
          <div className="nb-part">{q.given}</div>
          <div className="nb-part-unknown">?</div>
        </div>
      </div>

      {state.lastResult && (
        <div className={`nb-feedback ${state.lastResult}`}>
          {state.lastResult === "correct"
            ? "Correct! +10"
            : `Wrong! ${prevQ?.given} + ${prevQ?.answer} = ${prevQ?.target}`}
        </div>
      )}

      <form className="nb-form" onSubmit={e => { e.preventDefault(); dispatch({ type: "submit" }); }}>
        <input
          ref={inputRef}
          className="nb-input"
          type="text"
          inputMode="numeric"
          value={state.typed}
          onChange={e => dispatch({ type: "type", text: e.target.value })}
          placeholder="?"
          autoComplete="off"
        />
        <button type="submit" className="nb-btn">Enter</button>
      </form>
    </div>
  );
}
