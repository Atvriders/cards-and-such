import { useEffect, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { PhrazleState, PhrazleAction } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

type PhrazleSettings = Record<string, never>;

export function Phrazle({ state, dispatch, onGameOver }: GameProps<PhrazleState, PhrazleSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  const inputRef = useRef<HTMLInputElement>(null);

  // Build current row cells matching target structure
  const target = state.target;

  function renderRow(guess: string, marks: readonly import("./state.js").LetterMark[] | null, isActive: boolean) {
    const cells: JSX.Element[] = [];
    for (let i = 0; i < target.length; i++) {
      if (target[i] === " ") {
        cells.push(<span key={i} className="phrazle-cell space" />);
      } else {
        const ch = guess[i] ?? "";
        const mark = marks ? marks[i] : null;
        let cls = "phrazle-cell";
        if (mark === "green") cls += " green";
        else if (mark === "yellow") cls += " yellow";
        else if (mark === "gray" && marks) cls += " gray";
        else if (isActive && i === guess.replace(/ /g, "").length + (guess.match(/ /g) ?? []).length) cls += " active";
        cells.push(<span key={i} className={cls}>{ch.toUpperCase()}</span>);
      }
    }
    return cells;
  }

  if (state.won || state.lost) {
    return (
      <div className="phrazle-wrap">
        <div className="phrazle-title">Phrazle</div>
        <div className="phrazle-done">
          <h2>{state.won ? "Solved!" : "Out of guesses"}</h2>
          <div className="phrazle-target-display">{target}</div>
          {state.won && <p style={{ color: "#27ae60", fontWeight: 900, fontSize: "1.5rem" }}>
            Score: {(state.maxAttempts - state.attempts.length + 1) * 100}
          </p>}
        </div>
        <div className="phrazle-grid">
          {state.attempts.map((a, i) => (
            <div key={i} className="phrazle-row">{renderRow(a.guess, a.marks, false)}</div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="phrazle-wrap">
      <div className="phrazle-title">Phrazle</div>
      <div className="phrazle-hint">Guess the hidden phrase — spaces are shown automatically</div>
      <div className="phrazle-grid">
        {state.attempts.map((a, i) => (
          <div key={i} className="phrazle-row">{renderRow(a.guess, a.marks, false)}</div>
        ))}
        {state.attempts.length < state.maxAttempts && (
          <div className="phrazle-row">{renderRow(state.current, null, true)}</div>
        )}
      </div>
      <div className="phrazle-input-row">
        <input
          ref={inputRef}
          className="phrazle-input"
          type="text"
          placeholder="Type letters (no spaces needed)…"
          value=""
          onKeyDown={e => {
            e.preventDefault();
            if (e.key === "Enter") dispatch({ type: "submit" } as PhrazleAction);
            else if (e.key === "Backspace") dispatch({ type: "backspace" } as PhrazleAction);
            else if (/^[a-zA-Z]$/.test(e.key)) dispatch({ type: "letter", char: e.key } as PhrazleAction);
          }}
          onChange={() => {}}
          autoFocus
        />
        <button className="phrazle-btn" onClick={() => {
          dispatch({ type: "submit" } as PhrazleAction);
          inputRef.current?.focus();
        }}>Enter</button>
      </div>
      <div className="phrazle-error">{state.error ?? ""}</div>
      <div className="phrazle-hint">Attempt {state.attempts.length + 1} of {state.maxAttempts}</div>
    </div>
  );
}
