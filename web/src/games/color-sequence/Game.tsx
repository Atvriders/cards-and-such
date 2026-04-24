import { useEffect, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { ColorSequenceState } from "./state.js";
import { isTerminal, CS_COLORS } from "./state.js";
import type { colorSequenceSettings } from "./index.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import "./Game.css";

type Settings = SettingsOf<typeof colorSequenceSettings>;

const FLASH_ON_MS = 500;
const FLASH_OFF_MS = 200;

export function ColorSequence({
  state,
  dispatch,
  onGameOver,
}: GameProps<ColorSequenceState, Settings>): JSX.Element {
  const terminal = isTerminal(state);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  useEffect(() => {
    if (state.phase !== "showing") return;
    const delay = state.flashIndex === -1 ? FLASH_OFF_MS : FLASH_ON_MS;
    timerRef.current = setTimeout(() => dispatch({ type: "advance-flash" }), delay);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [state.phase, state.flashIndex, dispatch]);

  const activeColor = state.activeColor;

  const statusText = () => {
    switch (state.phase) {
      case "idle": return "Press Start to play!";
      case "showing": return "Watch the sequence...";
      case "input": return `Your turn! Step ${state.playerIndex + 1}/${state.sequence.length}`;
      case "complete": return `Round ${state.round} complete!`;
      case "failed": return `Wrong! Completed ${state.round - 1} round(s).`;
      default: return "";
    }
  };

  const inputDisabled = state.phase !== "input" || !!terminal;

  const COLOR_LABELS: Record<string, string> = {
    red: "🔴", green: "🟢", blue: "🔵", yellow: "🟡", purple: "🟣",
  };

  return (
    <div className="cs-game">
      <div className="cs-info">
        <span>Round: <strong>{state.round}</strong></span>
        <span>Sequence: <strong>{state.sequence.length}</strong></span>
      </div>

      <div className={`cs-status${state.phase === "failed" ? " failed" : state.phase === "complete" ? " complete" : ""}`}>
        {statusText()}
      </div>

      <div className="cs-board">
        {CS_COLORS.map((color) => (
          <button
            key={color}
            className={`cs-btn cs-${color}${activeColor === color ? " active" : ""}`}
            onClick={() => dispatch({ type: "click", color })}
            disabled={inputDisabled}
            aria-label={color}
          >
            {COLOR_LABELS[color]}
          </button>
        ))}
      </div>

      {(state.phase === "idle" || state.phase === "complete" || state.phase === "failed") && !terminal && (
        <button className="cs-start-btn" onClick={() => dispatch({ type: "start" })}>
          {state.phase === "idle" ? "Start" : state.phase === "complete" ? "Next Round" : "Play Again"}
        </button>
      )}

      {terminal && (
        <div className="cs-status">Final Score: {terminal.score} rounds</div>
      )}
    </div>
  );
}
