import { useEffect, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { SequenceFlashState } from "./state.js";
import { isTerminal } from "./state.js";
import type { sequenceFlashSettings } from "./index.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import "./SequenceFlash.css";

type SequenceFlashSettings = SettingsOf<typeof sequenceFlashSettings>;

const FLASH_MS = 600;

export function SequenceFlash({
  state,
  dispatch,
  onGameOver,
}: GameProps<SequenceFlashState, SequenceFlashSettings>): JSX.Element {
  const terminal = isTerminal(state);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  useEffect(() => {
    if (state.phase !== "flashing") return;
    timerRef.current = setTimeout(() => {
      dispatch({ type: "advance-flash" });
    }, FLASH_MS);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [state.phase, state.flashStep, dispatch]);

  const statusText = () => {
    switch (state.phase) {
      case "idle": return "Press Start to watch the sequence!";
      case "flashing": return `Watch... (${state.flashStep + 1}/${state.sequence.length})`;
      case "input": return `Tap the cells in order! (${state.playerInput.length}/${state.sequence.length})`;
      case "complete": return `Round ${state.round} done!`;
      case "failed": return `Wrong! You cleared ${state.round - 1} round(s).`;
      default: return "";
    }
  };

  const totalCells = state.gridSize * state.gridSize;
  const inputDisabled = state.phase !== "input" || !!terminal;

  const getCellClass = (index: number): string => {
    const isActive = state.activeCell === index;
    const isInputted = state.playerInput.includes(index);
    if (state.phase === "flashing" && isActive) return "sf-cell flashing";
    if (state.phase === "input" && isInputted) return "sf-cell tapped";
    return "sf-cell";
  };

  return (
    <div className="sequence-flash">
      <div className="sf-info">
        <span>Round: <strong>{state.round}</strong></span>
        <span>Length: <strong>{state.sequence.length}</strong></span>
      </div>
      <div className={`sf-status${state.phase === "failed" ? " failed" : state.phase === "complete" ? " complete" : ""}`}>
        {statusText()}
      </div>
      <div className="sf-grid" style={{ gridTemplateColumns: `repeat(${state.gridSize}, 1fr)` }}>
        {Array.from({ length: totalCells }, (_, i) => (
          <button
            key={i}
            className={getCellClass(i)}
            onClick={() => dispatch({ type: "tap-cell", cell: i })}
            disabled={inputDisabled}
          />
        ))}
      </div>
      {(state.phase === "idle" || state.phase === "complete" || state.phase === "failed") && !terminal && (
        <button className="sf-start-btn" onClick={() => dispatch({ type: "start" })}>
          {state.phase === "idle" ? "Start" : state.phase === "complete" ? "Next Round" : "Try Again"}
        </button>
      )}
    </div>
  );
}
