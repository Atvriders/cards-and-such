import { useEffect, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { RhymeTimeState, RhymeTimeAction, RhymeTimeSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

export function RhymeTime({ state, dispatch, onGameOver }: GameProps<RhymeTimeState, RhymeTimeSettings>): JSX.Element {
  const terminal = isTerminal(state);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (state.phase !== "playing") {
      if (tickRef.current) clearInterval(tickRef.current);
      return;
    }
    tickRef.current = setInterval(() => {
      dispatch({ type: "tick" } as RhymeTimeAction);
    }, 1000);
    return () => {
      if (tickRef.current) clearInterval(tickRef.current);
    };
  }, [state.phase, dispatch]);

  if (state.phase === "done") {
    return (
      <div className="rhyme-wrap">
        <div className="rhyme-done">
          <h2>Time's Up!</h2>
          <p>Prompt word: <strong>{state.promptWord}</strong></p>
          <p>Rhymes found: <strong>{state.foundRhymes.length}</strong></p>
          <p style={{ fontSize: "1.8rem", fontWeight: 900, color: "#27ae60" }}>Score: {state.foundRhymes.length * 10}</p>
          <div className="rhyme-done-words">
            {state.foundRhymes.map((w, i) => (
              <span key={i} className="rhyme-found-word">{w}</span>
            ))}
          </div>
          {state.validRhymes.filter(r => !state.foundRhymes.includes(r)).length > 0 && (
            <p style={{ fontSize: "0.85rem", color: "#888", marginTop: 12 }}>
              Missed: {state.validRhymes.filter(r => !state.foundRhymes.includes(r)).slice(0, 8).join(", ")}
              {state.validRhymes.filter(r => !state.foundRhymes.includes(r)).length > 8 ? "…" : ""}
            </p>
          )}
        </div>
      </div>
    );
  }

  const urgent = state.timeLeft <= 10;

  return (
    <div className="rhyme-wrap">
      <div className="rhyme-header">
        <span className="rhyme-score">{state.foundRhymes.length} rhymes found</span>
        <span className={`rhyme-timer${urgent ? " urgent" : ""}`}>{state.timeLeft}s</span>
      </div>

      <div className="rhyme-prompt-section">
        <div className="rhyme-prompt-label">Find words that rhyme with:</div>
        <div className="rhyme-prompt-word">{state.promptWord}</div>
        <div className="rhyme-ending-hint">Ending: "…{state.ending}"</div>
      </div>

      <div className="rhyme-found">
        {state.foundRhymes.length === 0 && (
          <span style={{ color: "#bdc3c7", alignSelf: "center" }}>Found rhymes appear here</span>
        )}
        {state.foundRhymes.map((w, i) => (
          <span key={i} className="rhyme-found-word">{w}</span>
        ))}
      </div>

      <div className="rhyme-input-row">
        <input
          className="rhyme-input"
          type="text"
          value={state.inputText}
          placeholder={`Type a rhyme for "${state.promptWord}"…`}
          onChange={e => dispatch({ type: "type", text: e.target.value } as RhymeTimeAction)}
          onKeyDown={e => {
            if (e.key === "Enter") dispatch({ type: "submit" } as RhymeTimeAction);
          }}
          autoFocus
        />
        <button data-testid="hint-target-rhyme-time-action"
          className="rhyme-btn"
          onClick={() => dispatch({ type: "submit" } as RhymeTimeAction)}
        >
          Submit
        </button>
      </div>

      <div className="rhyme-error">{state.lastError}</div>
    </div>
  );
}
