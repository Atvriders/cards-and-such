import { useEffect, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { MelodyRepeaterState } from "./state.js";
import { isTerminal, NOTES } from "./state.js";
import type { melodyRepeaterSettings } from "./index.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import "./MelodyRepeater.css";

type MelodyRepeaterSettings = SettingsOf<typeof melodyRepeaterSettings>;

const NOTE_COLORS: Record<string, string> = {
  C: "#e53e3e",
  D: "#dd6b20",
  E: "#d69e2e",
  F: "#38a169",
  G: "#3182ce",
  A: "#805ad5",
};

const NOTE_MS = 600;

export function MelodyRepeater({
  state,
  dispatch,
  onGameOver,
}: GameProps<MelodyRepeaterState, MelodyRepeaterSettings>): JSX.Element {
  const terminal = isTerminal(state);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  useEffect(() => {
    if (state.phase !== "playing") return;
    timerRef.current = setTimeout(() => {
      dispatch({ type: "advance-note" });
    }, NOTE_MS);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [state.phase, state.flashIndex, dispatch]);

  const statusText = () => {
    switch (state.phase) {
      case "idle": return "Press Start to hear the melody!";
      case "playing": return "Listen carefully...";
      case "input": return `Repeat it! Note ${state.playerIndex + 1} of ${state.melody.length}`;
      case "complete": return `Round ${state.round} done! Great memory!`;
      case "failed": return `Wrong note! You cleared ${state.round - 1} round(s).`;
      default: return "";
    }
  };

  const inputDisabled = state.phase !== "input" || !!terminal;

  return (
    <div className="melody-repeater">
      <div className="mr-info">
        <span>Round: <strong>{state.round}</strong></span>
        <span>Length: <strong>{state.melody.length}</strong></span>
      </div>
      <div className={`mr-status${state.phase === "failed" ? " failed" : state.phase === "complete" ? " complete" : ""}`}>
        {statusText()}
      </div>
      <div className="mr-melody-preview">
        {(state.phase === "playing" || state.phase === "input") && state.melody.map((n, i) => (
          <span
            key={i}
            className="mr-note-chip"
            style={{
              background: i === state.flashIndex && state.phase === "playing"
                ? NOTE_COLORS[n]
                : i < state.playerIndex && state.phase === "input"
                ? "#c6f6d5"
                : i === state.playerIndex && state.phase === "input"
                ? "#bee3f8"
                : "#edf2f7",
              color: i === state.flashIndex && state.phase === "playing" ? "#fff" : "#333",
            }}
          >
            {n}
          </span>
        ))}
      </div>
      <div className="mr-keys">
        {NOTES.map((note) => (
          <button
            key={note}
            className={`mr-key${state.activeNote === note ? " active" : ""}`}
            style={{ "--note-color": NOTE_COLORS[note] } as React.CSSProperties}
            onClick={() => dispatch({ type: "play", note })}
            disabled={inputDisabled}
          >
            {note}
          </button>
        ))}
      </div>
      {(state.phase === "idle" || state.phase === "complete" || state.phase === "failed") && !terminal && (
        <button data-testid="hint-target-melody-repeater-action" className="mr-start-btn" onClick={() => dispatch({ type: "start" })}>
          {state.phase === "idle" ? "Start" : state.phase === "complete" ? "Next Round" : "Try Again"}
        </button>
      )}
    </div>
  );
}
