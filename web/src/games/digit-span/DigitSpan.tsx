import { useEffect, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DigitSpanState } from "./state.js";
import { isTerminal } from "./state.js";
import type { digitSpanSettings } from "./index.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import "./DigitSpan.css";

type DigitSpanSettings = SettingsOf<typeof digitSpanSettings>;

const MAX_LIVES = 3;
const DIGIT_DISPLAY_MS = 800;

export function DigitSpan({
  state,
  dispatch,
  onGameOver,
}: GameProps<DigitSpanState, DigitSpanSettings>): JSX.Element {
  const terminal = isTerminal(state);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (terminal) {
      onGameOver(terminal.score);
    }
  }, [terminal, onGameOver]);

  // Auto-advance digits during show phase
  useEffect(() => {
    if (state.phase !== "show") return;
    timerRef.current = setTimeout(() => {
      dispatch({ type: "tick" });
    }, DIGIT_DISPLAY_MS);
    return () => {
      if (timerRef.current !== null) clearTimeout(timerRef.current);
    };
  }, [state.phase, state.showIndex, dispatch]);

  const currentDigit =
    state.phase === "show" && state.showIndex < state.sequence.length
      ? state.sequence[state.showIndex]
      : null;

  return (
    <div className="digit-span">
      <div className="ds-info">
        <span>Round: <strong>{state.round}</strong></span>
        <span>Span: <strong>{state.spanLength}</strong></span>
        <span>Correct: <strong>{state.correct}</strong></span>
        <span>
          Lives:{" "}
          <strong>
            {"❤️".repeat(state.lives)}{"🖤".repeat(MAX_LIVES - state.lives)}
          </strong>
        </span>
      </div>

      {state.phase === "show" && (
        <div className="ds-display">
          {currentDigit !== null ? (
            <span className="ds-digit">{currentDigit}</span>
          ) : (
            <span className="ds-digit ds-blank">…</span>
          )}
          <div className="ds-progress">
            {state.sequence.map((_, i) => (
              <div
                key={i}
                className={`ds-dot${i < state.showIndex ? " ds-dot-shown" : i === state.showIndex ? " ds-dot-current" : ""}`}
              />
            ))}
          </div>
        </div>
      )}

      {state.phase === "feedback" && (
        <div className={`ds-feedback ${state.lastCorrect ? "correct" : "wrong"}`}>
          {state.lastCorrect
            ? `Correct! Next span: ${state.spanLength + 1}`
            : `Wrong. Sequence was: ${state.sequence.join(" ")}`}
          <button className="ds-next-btn" onClick={() => dispatch({ type: "next" })}>
            Continue
          </button>
        </div>
      )}

      {state.phase === "input" && !terminal && (
        <div className="ds-input-area">
          <div className="ds-prompt">
            Enter {state.settings.mode === "backward" ? "REVERSED " : ""}sequence:
          </div>
          <div className="ds-entered">
            {Array.from({ length: state.spanLength }, (_, i) => (
              <span key={i} className={`ds-slot${i < state.input.length ? " ds-slot-filled" : ""}`}>
                {state.input[i] ?? "_"}
              </span>
            ))}
          </div>
          <div className="ds-numpad">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, null, 0, "⌫"].map((d, i) => (
              <button
                key={i}
                className={`ds-key${d === null ? " ds-key-hidden" : ""}`}
                disabled={d === null}
                onClick={() => {
                  if (d === null) return;
                  if (d === "⌫") {
                    dispatch({ type: "type", digit: "" });
                    // hack: just re-submit with shorter string via internal state
                    // We'll handle backspace by dispatching a special action
                    return;
                  }
                  dispatch({ type: "type", digit: String(d) });
                }}
              >
                {d === null ? "" : d}
              </button>
            ))}
          </div>
          <button
            className="ds-submit-btn"
            disabled={state.input.length < state.spanLength}
            onClick={() => dispatch({ type: "submit" })}
          >
            Submit
          </button>
        </div>
      )}

      {terminal && (
        <div className="ds-ended">
          Game over! Correct rounds: {state.correct} · Final span: {state.spanLength} · Score: {terminal.score}
        </div>
      )}
    </div>
  );
}
