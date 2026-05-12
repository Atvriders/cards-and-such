import { useEffect, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { NumberMemoryState } from "./state.js";
import { isTerminal } from "./state.js";
import type { numberMemorySettings } from "./index.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import "./Game.css";

type Settings = SettingsOf<typeof numberMemorySettings>;

const SHOW_MS = 2000;

export function NumberMemory({
  state,
  dispatch,
  onGameOver,
}: GameProps<NumberMemoryState, Settings>): JSX.Element {
  const terminal = isTerminal(state);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  // Auto-hide after SHOW_MS
  useEffect(() => {
    if (state.phase !== "showing") return;
    timerRef.current = setTimeout(() => {
      dispatch({ type: "reveal" });
    }, SHOW_MS);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [state.phase, state.round, dispatch]);

  const digits = ["1","2","3","4","5","6","7","8","9","0"];

  return (
    <div className="nm-game">
      <div className="nm-header">
        <span>Round <strong>{state.round}/{state.maxRound}</strong></span>
        <span>Score <strong>{state.score}</strong></span>
        <span>Best Streak <strong>{state.bestStreak}</strong></span>
      </div>

      {state.phase === "idle" && (
        <div className="nm-center">
          <p className="nm-desc">A number will flash for 2 seconds. Type it from memory!</p>
          <button data-testid="hint-target-number-memory-primary" className="nm-btn-primary" onClick={() => dispatch({ type: "start" })}>Start</button>
        </div>
      )}

      {state.phase === "showing" && (
        <div className="nm-center">
          <p className="nm-label">Memorize this number!</p>
          <div className="nm-number">{state.currentNumber}</div>
          <div className="nm-timer-bar">
            <div className="nm-timer-fill" style={{ animationDuration: `${SHOW_MS}ms` }} />
          </div>
        </div>
      )}

      {state.phase === "input" && (
        <div className="nm-center">
          <p className="nm-label">What was the number?</p>
          <div className="nm-input-display">
            {state.playerInput || <span className="nm-placeholder">_ _ _</span>}
          </div>
          <div className="nm-keypad">
            {digits.map((d) => (
              <button key={d} className="nm-key" onClick={() => dispatch({ type: "type-digit", digit: d })}>{d}</button>
            ))}
            <button className="nm-key nm-key-del" onClick={() => dispatch({ type: "backspace" })} title="Backspace">⌫</button>
            <button
              className="nm-key nm-key-ok"
              disabled={state.playerInput.length < state.currentNumber.length}
              onClick={() => dispatch({ type: "submit" })}
            >OK</button>
          </div>
        </div>
      )}

      {state.phase === "result" && (
        <div className="nm-center">
          <div className={`nm-result ${state.lastCorrect ? "correct" : "wrong"}`}>
            {state.lastCorrect ? "Correct!" : "Wrong!"}
          </div>
          {!state.lastCorrect && (
            <p className="nm-answer">The number was: <strong>{state.currentNumber}</strong></p>
          )}
          <p className="nm-answer">You typed: <strong>{state.playerInput}</strong></p>
          {state.round < state.maxRound ? (
            <button className="nm-btn-primary" onClick={() => dispatch({ type: "next" })}>Next</button>
          ) : (
            <button className="nm-btn-primary" onClick={() => dispatch({ type: "next" })}>Finish</button>
          )}
        </div>
      )}

      {state.phase === "done" && (
        <div className="nm-center">
          <div className="nm-result correct">Game Over!</div>
          <p className="nm-answer">Final Score: <strong>{terminal?.score ?? state.score}</strong></p>
          <p className="nm-answer">Best Streak: <strong>{state.bestStreak}</strong></p>
          <button className="nm-btn-primary" onClick={() => dispatch({ type: "start" })}>Play Again</button>
        </div>
      )}
    </div>
  );
}
