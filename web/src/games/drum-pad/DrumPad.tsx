import { useEffect, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DrumPadState } from "./state.js";
import { isTerminal, DRUM_SOUNDS } from "./state.js";
import type { drumPadSettings } from "./index.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import "./DrumPad.css";

type DrumPadSettings = SettingsOf<typeof drumPadSettings>;

const PAD_COLORS: Record<string, string> = {
  kick: "#c53030",
  snare: "#2b6cb0",
  hihat: "#d69e2e",
  tom: "#276749",
};

const PAD_LABELS: Record<string, string> = {
  kick: "Kick",
  snare: "Snare",
  hihat: "Hi-Hat",
  tom: "Tom",
};

const FLASH_MS = 550;

export function DrumPad({
  state,
  dispatch,
  onGameOver,
}: GameProps<DrumPadState, DrumPadSettings>): JSX.Element {
  const terminal = isTerminal(state);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  useEffect(() => {
    if (state.phase !== "showing") return;
    timerRef.current = setTimeout(() => {
      dispatch({ type: "advance-flash" });
    }, FLASH_MS);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [state.phase, state.flashIndex, dispatch]);

  const statusText = () => {
    switch (state.phase) {
      case "idle": return "Press Start to see the drum pattern!";
      case "showing": return `Watch the beat... (${state.flashIndex + 1}/${state.pattern.length})`;
      case "input": return `Replay it! Hit ${state.playerInput.length + 1} of ${state.pattern.length}`;
      case "complete": return `Round ${state.round} done! Great rhythm!`;
      case "failed": return `Wrong pad! You cleared ${state.round - 1} round(s).`;
      default: return "";
    }
  };

  const inputDisabled = state.phase !== "input" || !!terminal;

  return (
    <div className="drum-pad-game">
      <div className="dp-info">
        <span>Round: <strong>{state.round}</strong></span>
        <span>Length: <strong>{state.pattern.length}</strong></span>
      </div>
      <div className={`dp-status${state.phase === "failed" ? " failed" : state.phase === "complete" ? " complete" : ""}`}>
        {statusText()}
      </div>
      <div className="dp-pattern-preview">
        {(state.phase === "showing" || state.phase === "input") && state.pattern.map((sound, i) => (
          <span
            key={i}
            className="dp-beat-chip"
            style={{
              background: i === state.flashIndex && state.phase === "showing"
                ? PAD_COLORS[sound]
                : i < state.playerInput.length && state.phase === "input"
                ? "#c6f6d5"
                : "#edf2f7",
              color: i === state.flashIndex && state.phase === "showing" ? "#fff" : "#333",
            }}
          >
            {PAD_LABELS[sound]?.charAt(0)}
          </span>
        ))}
      </div>
      <div className="dp-pads">
        {DRUM_SOUNDS.map((sound) => (
          <button
            key={sound}
            className={`dp-pad${state.activeSound === sound ? " active" : ""}`}
            style={{ "--pad-color": PAD_COLORS[sound] } as React.CSSProperties}
            onClick={() => dispatch({ type: "hit", sound })}
            disabled={inputDisabled}
          >
            {PAD_LABELS[sound]}
          </button>
        ))}
      </div>
      {(state.phase === "idle" || state.phase === "complete" || state.phase === "failed") && !terminal && (
        <button data-testid="hint-target-drum-pad-action" className="dp-start-btn" onClick={() => dispatch({ type: "start" })}>
          {state.phase === "idle" ? "Start" : state.phase === "complete" ? "Next Round" : "Try Again"}
        </button>
      )}
    </div>
  );
}
