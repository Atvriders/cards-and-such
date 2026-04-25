import { useEffect, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { MosaicCopyState } from "./state.js";
import { isTerminal } from "./state.js";
import type { mosaicCopySettings } from "./index.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import "./MosaicCopy.css";

type MosaicCopySettings = SettingsOf<typeof mosaicCopySettings>;

export function MosaicCopy({
  state,
  dispatch,
  onGameOver,
}: GameProps<MosaicCopyState, MosaicCopySettings>): JSX.Element {
  const terminal = isTerminal(state);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  // Auto-hide pattern after memorize time
  useEffect(() => {
    if (state.phase !== "memorize") return;
    timerRef.current = setTimeout(() => {
      dispatch({ type: "hide" });
    }, state.memorizeTimeMs);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [state.phase, state.memorizeTimeMs, dispatch]);

  const totalCells = state.gridSize * state.gridSize;

  const statusText = () => {
    switch (state.phase) {
      case "idle": return "Press Start to see the mosaic!";
      case "memorize": return `Memorize! (pattern hides in ${state.memorizeTimeMs / 1000}s)`;
      case "input": return `Recreate the pattern — then Submit (${state.pattern.length} tiles)`;
      case "complete": return `Perfect! Round ${state.round} done!`;
      case "failed": return `Not quite! You cleared ${state.round - 1} round(s).`;
      default: return "";
    }
  };

  const getCellClass = (index: number): string => {
    if (state.phase === "memorize") {
      return state.pattern.includes(index) ? "mc-cell lit" : "mc-cell";
    }
    if (state.phase === "failed") {
      const inPattern = state.pattern.includes(index);
      const inPlayer = state.playerFilled.includes(index);
      if (inPattern && inPlayer) return "mc-cell correct";
      if (inPattern) return "mc-cell missed";
      if (inPlayer) return "mc-cell wrong";
      return "mc-cell";
    }
    if (state.phase === "complete") {
      return state.pattern.includes(index) ? "mc-cell lit" : "mc-cell";
    }
    return state.playerFilled.includes(index) ? "mc-cell selected" : "mc-cell";
  };

  const inputDisabled = state.phase !== "input" || !!terminal;

  return (
    <div className="mosaic-copy">
      <div className="mc-info">
        <span>Round: <strong>{state.round}</strong></span>
        <span>Tiles: <strong>{state.pattern.length}</strong></span>
      </div>
      <div className={`mc-status${state.phase === "failed" ? " failed" : state.phase === "complete" ? " complete" : ""}`}>
        {statusText()}
      </div>
      <div className="mc-grid" style={{ gridTemplateColumns: `repeat(${state.gridSize}, 1fr)` }}>
        {Array.from({ length: totalCells }, (_, i) => (
          <button
            key={i}
            className={getCellClass(i)}
            onClick={() => dispatch({ type: "toggle-cell", cell: i })}
            disabled={inputDisabled}
          />
        ))}
      </div>
      {state.phase === "input" && !terminal && (
        <button
          className="mc-submit-btn"
          onClick={() => dispatch({ type: "submit" })}
          disabled={state.playerFilled.length === 0}
        >
          Submit ({state.playerFilled.length}/{state.pattern.length})
        </button>
      )}
      {(state.phase === "idle" || state.phase === "complete" || state.phase === "failed") && !terminal && (
        <button className="mc-start-btn" onClick={() => dispatch({ type: "start" })}>
          {state.phase === "idle" ? "Start" : state.phase === "complete" ? "Next Round" : "Try Again"}
        </button>
      )}
    </div>
  );
}
