import { useEffect, useState } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { NumberlinkState, NumberlinkSettings } from "./state.js";
import type { NumberlinkAction } from "./state.js";
import { isTerminal } from "./state.js";
import "./Numberlink.css";

const PALETTE = ["#e53935","#1e88e5","#43a047","#fb8c00","#8e24aa","#00acc1","#f06292","#8d6e63"];

export function Numberlink({ state, dispatch, onGameOver }: GameProps<NumberlinkState, NumberlinkSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  const { puzzle, paths, won } = state;
  const { size, endpoints } = puzzle;
  const [selectedColor, setSelectedColor] = useState<number>(0); // 0 = erase

  const colors = Array.from(new Set(endpoints.filter(v => v > 0))).sort();

  function handleCellClick(idx: number) {
    if (won) return;
    if (endpoints[idx] !== 0) return; // can't overwrite endpoints
    if (selectedColor === 0) {
      // erase
      if (paths[idx] !== 0) {
        dispatch({ type: "setPath", idx, color: 0 } as NumberlinkAction);
      }
    } else {
      dispatch({ type: "setPath", idx, color: selectedColor } satisfies NumberlinkAction);
    }
  }

  function cellStyle(idx: number): React.CSSProperties {
    const v = paths[idx]!;
    if (v === 0) return {};
    const colorIdx = (v - 1) % PALETTE.length;
    return { background: PALETTE[colorIdx] + "55", color: PALETTE[colorIdx] };
  }

  return (
    <div className="numberlink">
      <div className="numberlink-title">Numberlink</div>
      <div className={`numberlink-status${won ? " win" : ""}`}>
        {won ? `Solved! Score: ${terminal?.score ?? 0}` : `Moves: ${state.moves}`}
      </div>

      <div className="numberlink-grid" style={{ gridTemplateColumns: `repeat(${size}, 48px)` }}>
        {Array.from({ length: size * size }, (_, idx) => {
          const ep = endpoints[idx]!;
          const v = paths[idx]!;
          const colorIdx = (v - 1) % PALETTE.length;
          const bgColor = v > 0 ? PALETTE[colorIdx]! + "55" : "#f5f5f5";
          const textColor = v > 0 ? PALETTE[colorIdx]! : "#333";
          return (
            <div
              key={idx}
              className={`numberlink-cell${ep > 0 ? " endpoint" : ""}`}
              style={{
                background: bgColor,
                color: textColor,
                borderColor: ep > 0 ? (v > 0 ? PALETTE[(ep-1) % PALETTE.length]! : "#333") : "#ccc",
                ...cellStyle(idx),
              }}
              onClick={() => handleCellClick(idx)}
            >
              {ep > 0 ? ep : ""}
            </div>
          );
        })}
      </div>

      <div className="numberlink-controls">
        <button
          className={`color-btn erase${selectedColor === 0 ? " selected" : ""}`}
          style={{ background: "#888" }}
          onClick={() => setSelectedColor(0)}
        >
          Erase
        </button>
        {colors.map(c => (
          <button
            key={c}
            className={`color-btn${selectedColor === c ? " selected" : ""}`}
            style={{ background: PALETTE[(c - 1) % PALETTE.length]! }}
            onClick={() => setSelectedColor(c)}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="numberlink-hint">
        Select a color, then click cells to draw its path. All cells must be filled. Paths cannot cross.
      </div>

      <div className="numberlink-btns">
        <button onClick={() => dispatch({ type: "reset" })}>Reset</button>
        {selectedColor > 0 && (
          <button onClick={() => dispatch({ type: "clearPath", color: selectedColor } satisfies NumberlinkAction)}>
            Clear {selectedColor}
          </button>
        )}
      </div>
    </div>
  );
}
