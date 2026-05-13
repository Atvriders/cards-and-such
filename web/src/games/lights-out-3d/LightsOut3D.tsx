import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { LightsOut3DState, LightsOut3DSettings } from "./state.js";
import { isTerminal, xyzToIndex, countOn } from "./state.js";
import "./LightsOut3D.css";

const LAYER_LABELS = ["Top Layer (Z=2)", "Middle Layer (Z=1)", "Bottom Layer (Z=0)"];

export function LightsOut3D({
  state,
  dispatch,
  onGameOver,
}: GameProps<LightsOut3DState, LightsOut3DSettings>): JSX.Element {
  const terminal = isTerminal(state);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  const on = countOn(state.cells);

  return (
    <div className="lo3d fade-in">
      <div className="lo3d-info">
        <span>Lights on: {on} / 27</span>
        <span>Moves: {state.moves}</span>
      </div>

      <div className={`lo3d-status${state.won ? " won" : ""}`}>
        {state.won
          ? "All lights out! You solved it! 🎉"
          : "Press a cell to toggle it and its neighbors"}
      </div>

      <div className="lo3d-layers-row">
        {[2, 1, 0].map((z) => (
          <div className="lo3d-layer-group" key={z}>
            <div className="lo3d-layer-label">{LAYER_LABELS[2 - z]}</div>
            <div className="lo3d-layer">
              {Array.from({ length: 9 }, (_, i) => {
                const x = i % 3;
                const y = Math.floor(i / 3);
                const idx = xyzToIndex(x, y, z);
                const isOn = state.cells[idx];
                return (
                  <div
                    key={idx}
                    className={`lo3d-cell ${isOn ? "on" : "off"}`}
                    onClick={() => !state.won && dispatch({ type: "press", index: idx })}
                    title={`Cell (${x},${y},${z})`}
                  >
                    {isOn ? "💡" : ""}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <p className="lo3d-hint">
        Each press toggles the cell and up to 6 face-adjacent cells across all three layers.
        Goal: turn all 27 lights off!
      </p>
    </div>
  );
}
