import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { ConnectLightsState, ConnectLightsSettings } from "./state.js";
import type { ConnectLightsAction } from "./state.js";
import { isTerminal, ROWS, COLS, findPathGroups } from "./state.js";
import "./Game.css";

const COLOR_STYLES = [
  { bg: "#ff6b6b", glow: "#ff000080" },
  { bg: "#ffa94d", glow: "#ff990080" },
  { bg: "#ffe066", glow: "#ffcc0080" },
  { bg: "#69db7c", glow: "#00ff4480" },
  { bg: "#74c0fc", glow: "#0088ff80" },
];

export function ConnectLights({ state, dispatch, onGameOver }: GameProps<ConnectLightsState, ConnectLightsSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  // Compute which cells are part of a path group for highlighting
  const pathGroups = findPathGroups(state.grid);
  const inPath = new Set<string>();
  for (const group of pathGroups) {
    for (const [r, c] of group) inPath.add(`${r},${c}`);
  }

  return (
    <div className="cl-lights-game">
      <div className="cl-lights-header">
        <span>Score: <strong>{state.score}</strong></span>
        <span>Moves left: <strong>{state.movesLeft}</strong></span>
        {state.lastCleared > 0 && !state.over && (
          <span className="cl-lights-cleared">+{state.lastCleared} lights!</span>
        )}
      </div>

      {state.over && (
        <div className="cl-lights-over">
          Game Over! Final Score: <strong>{state.score}</strong>
        </div>
      )}

      {state.selected && (
        <div className="cl-lights-hint">
          Selected ({state.selected[0]},{state.selected[1]}) — click an adjacent light to swap
        </div>
      )}

      <div className="cl-lights-grid">
        {Array.from({ length: ROWS }, (_, r) =>
          Array.from({ length: COLS }, (_, c) => {
            const color = state.grid[r]![c];
            const isSelected = state.selected?.[0] === r && state.selected?.[1] === c;
            const isInPath = inPath.has(`${r},${c}`);
            const style = (color !== null && color !== undefined && color < COLOR_STYLES.length) ? COLOR_STYLES[color as 0|1|2|3|4] : { bg: "#333", glow: "transparent" };
            return (
              <div
                key={`${r}-${c}`}
                className={`cl-light ${isSelected ? "selected" : ""} ${isInPath ? "in-path" : ""} ${state.over ? "disabled" : ""}`}
                style={{
                  background: color !== null ? style!.bg : "#2c2c2c",
                  boxShadow: isSelected ? `0 0 12px 4px ${style!.glow}` : isInPath ? `0 0 8px 2px ${style!.glow}` : "none",
                }}
                onClick={() => !state.over && dispatch({ type: "select", row: r, col: c } satisfies ConnectLightsAction)}
              />
            );
          })
        )}
      </div>

      {!state.over && inPath.size > 0 && (
        <div className="cl-lights-path-hint">
          {inPath.size} lights connected! Make a swap to clear them.
        </div>
      )}
    </div>
  );
}
