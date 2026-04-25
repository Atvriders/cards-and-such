import { useEffect, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { MorseTapState } from "./state.js";
import { isTerminal } from "./state.js";
import type { morseTapSettings } from "./index.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import "./MorseTap.css";

type MorseTapSettings = SettingsOf<typeof morseTapSettings>;

const DOT_MS = 300;
const DASH_MS = 700;
const GAP_MS = 250;

export function MorseTap({
  state,
  dispatch,
  onGameOver,
}: GameProps<MorseTapState, MorseTapSettings>): JSX.Element {
  const terminal = isTerminal(state);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  useEffect(() => {
    if (state.phase !== "showing") return;
    const duration = state.activeSymbol === null ? GAP_MS : state.activeSymbol === "dot" ? DOT_MS : DASH_MS;
    timerRef.current = setTimeout(() => {
      dispatch({ type: "advance-flash" });
    }, duration);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [state.phase, state.flashIndex, state.activeSymbol, dispatch]);

  const statusText = () => {
    switch (state.phase) {
      case "idle": return "Press Start to learn Morse code!";
      case "showing": return `Watch: ${state.letter}`;
      case "input": return `Enter the Morse code for: ${state.letter}`;
      case "complete": return `Correct! Score: ${state.score}`;
      case "failed": return `Wrong! The correct code was: ${state.target.map(s => s === "dot" ? "•" : "—").join(" ")}`;
      default: return "";
    }
  };

  const inputDisabled = state.phase !== "input" || !!terminal;

  return (
    <div className="morse-tap">
      <div className="mt-info">
        <span>Round: <strong>{state.round}</strong></span>
        <span>Score: <strong>{state.score}</strong></span>
      </div>

      <div className={`mt-letter-display${state.phase === "showing" ? " showing" : ""}`}>
        {state.letter || "?"}
      </div>

      <div className="mt-flash-area">
        {state.phase === "showing" && (
          <div className={`mt-flash-dot${state.activeSymbol === "dot" ? " active" : ""}${state.activeSymbol === "dash" ? " dash" : ""}`} />
        )}
      </div>

      <div className={`mt-status${state.phase === "failed" ? " failed" : state.phase === "complete" ? " complete" : ""}`}>
        {statusText()}
      </div>

      <div className="mt-input-display">
        {state.playerInput.map((s, i) => (
          <span key={i} className={`mt-chip ${s}`}>{s === "dot" ? "•" : "—"}</span>
        ))}
        {state.playerInput.length === 0 && state.phase === "input" && (
          <span className="mt-placeholder">Click Dot or Dash...</span>
        )}
      </div>

      {state.phase === "input" && !terminal && (
        <div className="mt-controls">
          <button className="mt-btn dot" onClick={() => dispatch({ type: "tap", symbol: "dot" })} disabled={inputDisabled}>
            • Dot
          </button>
          <button className="mt-btn dash" onClick={() => dispatch({ type: "tap", symbol: "dash" })} disabled={inputDisabled}>
            — Dash
          </button>
          <button className="mt-btn submit" onClick={() => dispatch({ type: "submit" })} disabled={inputDisabled || state.playerInput.length === 0}>
            Submit
          </button>
        </div>
      )}

      {(state.phase === "idle" || state.phase === "complete" || state.phase === "failed") && !terminal && (
        <button className="mt-start-btn" onClick={() => dispatch({ type: "start" })}>
          {state.phase === "idle" ? "Start" : "Next Letter"}
        </button>
      )}
    </div>
  );
}
