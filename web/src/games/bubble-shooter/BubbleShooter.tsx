import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { BubbleShooterState } from "./state.js";
import { isTerminal } from "./state.js";
import type { bubbleShooterSettings } from "./index.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import "./BubbleShooter.css";

type BubbleShooterSettings = SettingsOf<typeof bubbleShooterSettings>;

export function BubbleShooter({
  state,
  dispatch,
  onGameOver,
}: GameProps<BubbleShooterState, BubbleShooterSettings>): JSX.Element {
  const terminal = isTerminal(state);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  const gridStyle = {
    gridTemplateColumns: `repeat(${state.cols}, 32px)`,
  };

  return (
    <div className="bubble-shooter">
      <div className="bs-info">
        <span>Shots: <strong>{state.shots}</strong></span>
        <span>Next: <strong>{state.settings.colors} colors</strong></span>
      </div>

      {terminal && (
        <div className={`bs-status ${state.won ? "won" : "lost"}`}>
          {state.won
            ? `You cleared the board! Score: ${terminal.score}`
            : "Bubbles reached the bottom!"}
        </div>
      )}

      <div className="bs-board">
        <div className="bs-grid" style={gridStyle}>
          {state.grid.map((cell, idx) => (
            <div
              key={idx}
              className={`bs-cell ${cell === null ? "empty" : `color-${cell}`}`}
            />
          ))}
        </div>
      </div>

      <div className="bs-shooter">
        <div className={`bs-current-bubble color-${state.currentBubble}`} />
        <div className="bs-controls">
          <span className="bs-aim-label">Aim: {state.angle > 0 ? "+" : ""}{state.angle}°</span>
          <input
            className="bs-aim-slider"
            type="range"
            min={-80}
            max={80}
            value={state.angle}
            onChange={(e) => dispatch({ type: "aim", angle: parseInt(e.target.value, 10) })}
            disabled={!!terminal}
          />
          <button data-testid="hint-target-bubble-shooter-action"
            className="bs-shoot-btn"
            onClick={() => dispatch({ type: "shoot" })}
            disabled={!!terminal}
          >
            Shoot
          </button>
        </div>
      </div>
    </div>
  );
}
