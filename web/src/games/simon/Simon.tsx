import { useEffect, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { SimonState } from "./state.js";
import { isTerminal, SIMON_COLORS } from "./state.js";
import type { simonSettings } from "./index.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import "./Simon.css";

type SimonSettings = SettingsOf<typeof simonSettings>;

const FLASH_ON_MS = 600;
const FLASH_OFF_MS = 200;

export function Simon({
  state,
  dispatch,
  onGameOver,
}: GameProps<SimonState, SimonSettings>): JSX.Element {
  const terminal = isTerminal(state);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  // Auto-advance flash during "showing" phase
  useEffect(() => {
    if (state.phase !== "showing") return;

    // Show current color for FLASH_ON_MS, then clear for FLASH_OFF_MS, then advance
    const showDelay = state.flashIndex === -1 ? FLASH_OFF_MS : FLASH_ON_MS;

    timerRef.current = setTimeout(() => {
      dispatch({ type: "advance-flash" });
    }, showDelay);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [state.phase, state.flashIndex, dispatch]);

  // Brief flash feedback on click in input phase
  const activeColor = state.activeColor;

  const statusText = () => {
    switch (state.phase) {
      case "idle": return "Press Start to play!";
      case "showing": return "Watch the sequence...";
      case "input": return `Your turn! Step ${state.playerIndex + 1}/${state.sequence.length}`;
      case "complete": return `Round ${state.round} complete! Press Next Round.`;
      case "failed": return `Wrong! Game over. You completed ${state.round - 1} round(s).`;
      default: return "";
    }
  };

  const inputDisabled = state.phase !== "input" || !!terminal;

  return (
    <div className="simon">
      <div className="simon-info">
        <span>Round: <strong>{state.round}</strong></span>
        <span>Sequence: <strong>{state.sequence.length}</strong></span>
      </div>

      <div className={`simon-status${state.phase === "failed" ? " failed" : state.phase === "complete" ? " complete" : ""}`}>
        {statusText()}
      </div>

      <div className="simon-board">
        {SIMON_COLORS.map((color) => (
          <button
            key={color}
            className={`simon-btn ${color}${activeColor === color ? " active" : ""}`}
            onClick={() => dispatch({ type: "click", color })}
            disabled={inputDisabled}
            aria-label={color}
          />
        ))}
      </div>

      {(state.phase === "idle" || state.phase === "complete" || state.phase === "failed") && !terminal && (
        <button
          className="simon-start-btn"
          onClick={() => dispatch({ type: "start" })}
        >
          {state.phase === "idle" ? "Start" : state.phase === "complete" ? "Next Round" : "Play Again"}
        </button>
      )}

      {terminal && (
        <div className="simon-status">Score: {terminal.score} rounds</div>
      )}
    </div>
  );
}
