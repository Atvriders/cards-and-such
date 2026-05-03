import { useEffect, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { RhythmLadderState } from "./state.js";
import { isTerminal, RUNG_COLORS } from "./state.js";
import type { rhythmLadderSettings } from "./index.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import "./RhythmLadder.css";

type RhythmLadderSettings = SettingsOf<typeof rhythmLadderSettings>;

const RUNG_COLOR_MAP: Record<string, string> = {
  red: "#e53e3e",
  blue: "#3182ce",
  green: "#38a169",
  yellow: "#d69e2e",
  purple: "#805ad5",
};

const DESCEND_MS = 550;

export function RhythmLadder({
  state,
  dispatch,
  onGameOver,
}: GameProps<RhythmLadderState, RhythmLadderSettings>): JSX.Element {
  const terminal = isTerminal(state);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  useEffect(() => {
    if (state.phase !== "descending") return;
    timerRef.current = setTimeout(() => {
      dispatch({ type: "advance-rung" });
    }, DESCEND_MS);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [state.phase, state.activeRung, dispatch]);

  const statusText = () => {
    switch (state.phase) {
      case "idle": return "Press Start to watch the ladder!";
      case "descending": return `Descending... rung ${state.activeRung + 1} of ${state.rungs.length}`;
      case "input": return `Climb back up! Step ${state.playerInput.length + 1} of ${state.rungs.length}`;
      case "complete": return `Round ${state.round} cleared!`;
      case "failed": return `Wrong step! You cleared ${state.round - 1} round(s).`;
      default: return "";
    }
  };

  const inputDisabled = state.phase !== "input" || !!terminal;

  return (
    <div className="rhythm-ladder">
      <div className="rl-info">
        <span>Round: <strong>{state.round}</strong></span>
        <span>Rungs: <strong>{state.rungs.length}</strong></span>
      </div>
      <div className={`rl-status${state.phase === "failed" ? " failed" : state.phase === "complete" ? " complete" : ""}`}>
        {statusText()}
      </div>
      <div className="rl-ladder">
        {state.rungs.map((color, i) => (
          <div
            key={i}
            className={`rl-rung${state.activeRung === i && state.phase === "descending" ? " active" : ""}${i < state.playerInput.length && state.phase === "input" ? " climbed" : ""}`}
            style={{ "--rung-color": RUNG_COLOR_MAP[color] } as React.CSSProperties}
          >
            <span className="rl-rung-number">{i + 1}</span>
          </div>
        ))}
        {state.rungs.length === 0 && (
          <div className="rl-empty">Ladder will appear here</div>
        )}
      </div>
      {state.phase === "input" && !terminal && (
        <div className="rl-color-buttons">
          {RUNG_COLORS.map((color) => (
            <button data-testid="hint-target-rhythm-ladder-action"
              key={color}
              className="rl-color-btn"
              style={{ background: RUNG_COLOR_MAP[color] }}
              onClick={() => dispatch({ type: "step", color })}
              disabled={inputDisabled}
            >
              {color}
            </button>
          ))}
        </div>
      )}
      {(state.phase === "idle" || state.phase === "complete" || state.phase === "failed") && !terminal && (
        <button className="rl-start-btn" onClick={() => dispatch({ type: "start" })}>
          {state.phase === "idle" ? "Start" : state.phase === "complete" ? "Next Round" : "Try Again"}
        </button>
      )}
    </div>
  );
}
