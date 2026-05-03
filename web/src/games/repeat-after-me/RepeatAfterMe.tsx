import { useEffect, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { RepeatAfterMeState } from "./state.js";
import { isTerminal, ACTIONS, ACTION_EMOJI, ACTION_LABEL } from "./state.js";
import type { repeatAfterMeSettings } from "./index.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import "./RepeatAfterMe.css";

type RepeatAfterMeSettings = SettingsOf<typeof repeatAfterMeSettings>;

const FLASH_MS = 600;

const ACTION_COLORS: Record<string, string> = {
  clap: "#e53e3e",
  stomp: "#38a169",
  snap: "#3182ce",
  tap: "#d69e2e",
};

export function RepeatAfterMe({
  state,
  dispatch,
  onGameOver,
}: GameProps<RepeatAfterMeState, RepeatAfterMeSettings>): JSX.Element {
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
      case "idle": return "Press Start to begin!";
      case "showing": return `Watch: step ${state.flashIndex + 1} of ${state.sequence.length}`;
      case "input": return `Perform step ${state.playerIndex + 1} of ${state.sequence.length}`;
      case "complete": return `Round ${state.round} nailed!`;
      case "failed": return `Wrong! You cleared ${state.round - 1} round(s).`;
      default: return "";
    }
  };

  const inputDisabled = state.phase !== "input" || !!terminal;

  return (
    <div className="repeat-after-me">
      <div className="ram-info">
        <span>Round: <strong>{state.round}</strong></span>
        <span>Length: <strong>{state.sequence.length}</strong></span>
      </div>
      <div className={`ram-status${state.phase === "failed" ? " failed" : state.phase === "complete" ? " complete" : ""}`}>
        {statusText()}
      </div>
      <div className="ram-sequence-preview">
        {(state.phase === "showing" || state.phase === "input") && state.sequence.map((a, i) => (
          <span
            key={i}
            className="ram-step-chip"
            style={{
              background: i === state.flashIndex && state.phase === "showing"
                ? ACTION_COLORS[a]
                : i < state.playerIndex && state.phase === "input"
                ? "#c6f6d5"
                : i === state.playerIndex && state.phase === "input"
                ? "#bee3f8"
                : "#edf2f7",
              color: i === state.flashIndex && state.phase === "showing" ? "#fff" : "#333",
            }}
          >
            {ACTION_EMOJI[a]}
          </span>
        ))}
      </div>
      <div className="ram-actions">
        {ACTIONS.map((action) => (
          <button
            key={action}
            className={`ram-action-btn${state.activeAction === action ? " active" : ""}`}
            style={{ "--action-color": ACTION_COLORS[action] } as React.CSSProperties}
            onClick={() => dispatch({ type: "perform", action })}
            disabled={inputDisabled}
          >
            <span className="ram-action-emoji">{ACTION_EMOJI[action]}</span>
            <span className="ram-action-label">{ACTION_LABEL[action]}</span>
          </button>
        ))}
      </div>
      {(state.phase === "idle" || state.phase === "complete" || state.phase === "failed") && !terminal && (
        <button data-testid="hint-target-repeat-after-me-action" className="ram-start-btn" onClick={() => dispatch({ type: "start" })}>
          {state.phase === "idle" ? "Start" : state.phase === "complete" ? "Next Round" : "Try Again"}
        </button>
      )}
    </div>
  );
}
