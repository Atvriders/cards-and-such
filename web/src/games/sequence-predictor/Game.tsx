import { useEffect, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { SequencePredictorState } from "./state.js";
import { isTerminal } from "./state.js";
import type { sequencePredictorSettings } from "./index.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import "./Game.css";

type SequencePredictorSettingsType = SettingsOf<typeof sequencePredictorSettings>;

const KIND_LABEL: Record<string, string> = {
  arithmetic: "Arithmetic",
  geometric: "Geometric",
  fibonacci: "Fibonacci-like",
};

export function SequencePredictorGame({ state, dispatch, onGameOver }: GameProps<SequencePredictorState, SequencePredictorSettingsType>): JSX.Element {
  const terminal = isTerminal(state);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  useEffect(() => {
    inputRef.current?.focus();
  }, [state.currentIndex]);

  const total = state.questions.length;
  const pct = (Math.min(state.currentIndex, total) / total) * 100;
  const q = state.questions[Math.min(state.currentIndex, total - 1)]!;
  const prevQ = state.currentIndex > 0 ? state.questions[state.currentIndex - 1] : null;

  if (terminal) {
    return (
      <div className="sp-wrap">
        <div className="sp-done">
          <h2>Finished!</h2>
          <p>Score: <strong>{terminal.score}</strong> &middot; {state.correctCount}/{total} correct</p>
        </div>
      </div>
    );
  }

  return (
    <div className="sp-wrap">
      <div className="sp-header">
        <span>Q <strong>{state.currentIndex + 1}</strong>/{total}</span>
        <span>Score: <strong>{state.score}</strong></span>
        <span>Correct: <strong>{state.correctCount}</strong></span>
      </div>

      <div className="sp-progress-bar">
        <div className="sp-progress-fill" style={{ width: `${pct}%` }} />
      </div>

      <div className="sp-sequence">
        {q.terms.map((t, i) => (
          <span key={i}>
            <span className="sp-term">{t}</span>
            {i < q.terms.length - 1 && <span className="sp-sep">, </span>}
          </span>
        ))}
        <span className="sp-sep">, </span>
        <span className="sp-q">?</span>
      </div>

      <span className="sp-kind">{KIND_LABEL[q.kind] ?? q.kind}</span>

      {state.lastResult && (
        <div className={`sp-feedback ${state.lastResult}`}>
          {state.lastResult === "correct" ? "Correct! +10" : `Wrong! Answer was ${prevQ?.answer ?? ""}`}
        </div>
      )}

      <form className="sp-form" onSubmit={e => { e.preventDefault(); dispatch({ type: "submit" }); }}>
        <input
          ref={inputRef}
          className="sp-input"
          type="text"
          inputMode="numeric"
          value={state.typed}
          onChange={e => dispatch({ type: "type", text: e.target.value })}
          placeholder="Next number"
          autoComplete="off"
        />
        <button type="submit" className="sp-btn">Enter</button>
      </form>
    </div>
  );
}
