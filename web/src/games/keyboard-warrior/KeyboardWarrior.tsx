import { useEffect, useCallback } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { KeyboardWarriorState, KeyboardWarriorSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./KeyboardWarrior.css";

export function KeyboardWarrior({
  state,
  dispatch,
  onGameOver,
}: GameProps<KeyboardWarriorState, KeyboardWarriorSettings>): JSX.Element {
  const terminal = isTerminal(state);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  const handleKey = useCallback((e: KeyboardEvent) => {
    const char = e.key.toLowerCase();
    if (char.length !== 1) return;
    if (state.startTime === null) {
      dispatch({ type: "start", time: Date.now() });
    }
    dispatch({ type: "key", char });
  }, [state.startTime, dispatch]);

  useEffect(() => {
    if (state.gameOver) return;
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [state.gameOver, handleKey]);

  const currentIdx = state.typed.length;
  const correct = state.typed.filter((c, i) => c === state.sequence[i]).length;

  return (
    <div className="kw-game">
      <div className="kw-title">Keyboard Warrior</div>

      {state.startTime === null && !state.gameOver && (
        <>
          <div className="kw-instructions">
            Press any key to start, then type the sequence below.
          </div>
          <button data-testid="hint-target-keyboard-warrior-action" className="kw-start-btn" onClick={() => dispatch({ type: "start", time: Date.now() })}>
            Start
          </button>
        </>
      )}

      <div className="kw-sequence">
        {state.sequence.map((char, i) => {
          let cls = "kw-char";
          if (i < state.typed.length) {
            cls += state.typed[i] === char ? " correct" : " wrong";
          } else if (i === currentIdx && state.startTime !== null) {
            cls += " active";
          }
          return (
            <div key={i} className={cls}>
              {char}
            </div>
          );
        })}
      </div>

      {!state.gameOver && state.startTime !== null && (
        <div className="kw-stats">
          <span>Typed: {state.typed.length}/{state.sequence.length}</span>
          <span>Errors: {state.errors}</span>
        </div>
      )}

      {state.gameOver && (
        <div className="kw-game-over">
          Done! {correct}/{state.sequence.length} correct<br />
          Errors: {state.errors}<br />
          <span style={{ fontSize: "0.85rem", opacity: 0.75 }}>
            Score: {terminal?.score}
          </span>
        </div>
      )}
    </div>
  );
}
