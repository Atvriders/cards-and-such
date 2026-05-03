import { useEffect, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { RomanNumeralsState } from "./state.js";
import { isTerminal } from "./state.js";
import type { romanNumeralsSettings } from "./index.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import "./Game.css";

type RomanNumeralsSettingsType = SettingsOf<typeof romanNumeralsSettings>;

export function RomanNumeralsGame({ state, dispatch, onGameOver }: GameProps<RomanNumeralsState, RomanNumeralsSettingsType>): JSX.Element {
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
  const toRoman = state.settings.direction === "to-roman";
  const prevQ = state.questions[state.currentIndex - 1];

  if (terminal) {
    return (
      <div className="rn-wrap">
        <div className="rn-done">
          <h2>Finished!</h2>
          <p>Score: <strong>{terminal.score}</strong> &middot; {state.correctCount}/{total} correct</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rn-wrap">
      <div className="rn-header">
        <span>Question <strong>{state.currentIndex + 1}</strong>/{total}</span>
        <span>Score: <strong>{state.score}</strong></span>
        <span>Correct: <strong>{state.correctCount}</strong></span>
      </div>

      <div className="rn-progress-bar">
        <div className="rn-progress-fill" style={{ width: `${pct}%` }} />
      </div>

      <div className="rn-problem">{toRoman ? q.arabic : q.roman}</div>
      <div className="rn-label">{toRoman ? "Type this number in Roman numerals" : "Type this Roman numeral as a number"}</div>

      {state.lastResult && (
        <div className={`rn-feedback ${state.lastResult}`}>
          {state.lastResult === "correct"
            ? "Correct! +10"
            : `Wrong! ${toRoman ? `${prevQ?.arabic} = ${prevQ?.roman}` : `${prevQ?.roman} = ${prevQ?.arabic}`}`}
        </div>
      )}

      <form className="rn-form" onSubmit={e => { e.preventDefault(); dispatch({ type: "submit" }); }}>
        <input
          ref={inputRef}
          className="rn-input"
          type="text"
          inputMode={toRoman ? "text" : "numeric"}
          value={state.typed}
          onChange={e => dispatch({ type: "type", text: e.target.value })}
          placeholder={toRoman ? "e.g. XIV" : "e.g. 14"}
          autoComplete="off"
        />
        <button data-testid="hint-target-roman-numerals-primary" type="submit" className="rn-btn">Enter</button>
      </form>
    </div>
  );
}
