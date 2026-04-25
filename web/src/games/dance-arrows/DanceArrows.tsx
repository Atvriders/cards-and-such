import { useEffect, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DanceArrowsState } from "./state.js";
import { isTerminal, ARROWS } from "./state.js";
import type { danceArrowsSettings } from "./index.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import "./DanceArrows.css";

type DanceArrowsSettings = SettingsOf<typeof danceArrowsSettings>;

const ARROW_SYMBOLS: Record<string, string> = {
  up: "▲",
  down: "▼",
  left: "◀",
  right: "▶",
};

const FLASH_ON_MS = 500;

export function DanceArrows({
  state,
  dispatch,
  onGameOver,
}: GameProps<DanceArrowsState, DanceArrowsSettings>): JSX.Element {
  const terminal = isTerminal(state);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  useEffect(() => {
    if (state.phase !== "showing") return;
    timerRef.current = setTimeout(() => {
      dispatch({ type: "advance-flash" });
    }, FLASH_ON_MS);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [state.phase, state.flashIndex, dispatch]);

  const statusText = () => {
    switch (state.phase) {
      case "idle": return "Press Start to dance!";
      case "showing": return "Watch the sequence...";
      case "input": return `Your turn! Step ${state.playerIndex + 1}/${state.sequence.length}`;
      case "complete": return `Round ${state.round} done! Keep going!`;
      case "failed": return `Wrong! You cleared ${state.round - 1} round(s).`;
      default: return "";
    }
  };

  const inputDisabled = state.phase !== "input" || !!terminal;

  return (
    <div className="dance-arrows">
      <div className="da-info">
        <span>Round: <strong>{state.round}</strong></span>
        <span>Length: <strong>{state.sequence.length}</strong></span>
      </div>
      <div className={`da-status${state.phase === "failed" ? " failed" : state.phase === "complete" ? " complete" : ""}`}>
        {statusText()}
      </div>
      <div className="da-sequence-preview">
        {state.phase === "showing" && state.sequence.map((a, i) => (
          <span key={i} className={`da-preview-arrow${i === state.flashIndex ? " active" : ""}`}>
            {ARROW_SYMBOLS[a]}
          </span>
        ))}
        {state.phase === "input" && state.sequence.map((a, i) => (
          <span key={i} className={`da-preview-arrow${i < state.playerIndex ? " done" : i === state.playerIndex ? " current" : ""}`}>
            {ARROW_SYMBOLS[a]}
          </span>
        ))}
      </div>
      <div className="da-board">
        <div className="da-row">
          <button
            className={`da-btn up${state.activeArrow === "up" ? " active" : ""}`}
            onClick={() => dispatch({ type: "press", arrow: "up" })}
            disabled={inputDisabled}
          >▲</button>
        </div>
        <div className="da-row">
          {ARROWS.filter(a => a === "left" || a === "right").map(arrow => (
            <button
              key={arrow}
              className={`da-btn ${arrow}${state.activeArrow === arrow ? " active" : ""}`}
              onClick={() => dispatch({ type: "press", arrow })}
              disabled={inputDisabled}
            >{ARROW_SYMBOLS[arrow]}</button>
          ))}
        </div>
        <div className="da-row">
          <button
            className={`da-btn down${state.activeArrow === "down" ? " active" : ""}`}
            onClick={() => dispatch({ type: "press", arrow: "down" })}
            disabled={inputDisabled}
          >▼</button>
        </div>
      </div>
      {(state.phase === "idle" || state.phase === "complete" || state.phase === "failed") && !terminal && (
        <button className="da-start-btn" onClick={() => dispatch({ type: "start" })}>
          {state.phase === "idle" ? "Start" : state.phase === "complete" ? "Next Round" : "Try Again"}
        </button>
      )}
    </div>
  );
}
