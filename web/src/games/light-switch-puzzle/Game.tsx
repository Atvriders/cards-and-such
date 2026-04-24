import { useEffect, useCallback } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { LightSwitchState, LightSwitchSettings, LightSwitchAction } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

export function LightSwitchGame({
  state,
  dispatch,
  onGameOver,
}: GameProps<LightSwitchState, LightSwitchSettings>): JSX.Element {
  const terminal = isTerminal(state);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  const handleToggle = useCallback(
    (index: number) => {
      if (terminal) return;
      dispatch({ type: "toggle", index } as LightSwitchAction);
    },
    [dispatch, terminal],
  );

  const { size, lights, target } = state;

  return (
    <div className="light-switch">
      <div className="light-switch-info">
        <span>Grid: {size}×{size}</span>
        <span>Moves: {state.movesMade}</span>
      </div>
      <div className={`light-switch-status${state.won ? " win" : ""}`}>
        {state.won ? "Pattern matched! Well done!" : "Toggle lights to match the target"}
      </div>

      <div className="light-switch-panels">
        <div className="light-switch-panel">
          <div className="light-switch-label">Current</div>
          <div
            className="light-switch-grid"
            style={{ gridTemplateColumns: `repeat(${size}, 44px)` }}
          >
            {lights.map((on, i) => (
              <div
                key={i}
                className={`light-switch-cell ${on ? "on" : "off"}`}
                onClick={() => handleToggle(i)}
              >
                {on ? "💡" : "·"}
              </div>
            ))}
          </div>
        </div>

        <div className="light-switch-panel">
          <div className="light-switch-label">Target</div>
          <div
            className="light-switch-grid"
            style={{ gridTemplateColumns: `repeat(${size}, 44px)` }}
          >
            {target.map((on, i) => (
              <div
                key={i}
                className={`light-switch-cell readonly ${on ? "on" : "off"}`}
              >
                {on ? "💡" : "·"}
              </div>
            ))}
          </div>
        </div>
      </div>

      <p className="light-switch-hint">
        Click a light to toggle it and its neighbors. Match the target pattern to win.
      </p>
    </div>
  );
}
