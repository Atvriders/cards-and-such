import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { ThermometerState, ThermometerSettings } from "./state.js";
import type { ThermometerAction } from "./state.js";
import { isTerminal } from "./state.js";
import "./Thermometer.css";

const CELL = 40;

export function Thermometer({ state, dispatch, onGameOver }: GameProps<ThermometerState, ThermometerSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  const { puzzle, filled, won } = state;
  const { rows, cols, thermometers, rowClues, colClues } = puzzle;

  // For each thermometer, determine how many cells are currently filled
  function getThermFill(thermIdx: number): number {
    const therm = thermometers[thermIdx]!;
    let count = 0;
    for (const [r, c] of therm.cells) {
      if (filled[r * cols + c]) count++;
      else break; // mercury must be continuous from bulb
    }
    return count;
  }

  function handleThermClick(thermIdx: number, cellInTherm: number) {
    if (won) return;
    const currentFill = getThermFill(thermIdx);
    // clicking at position cellInTherm+1 sets fill to that level (or toggles off)
    const clickedLevel = cellInTherm + 1;
    const newFill = currentFill === clickedLevel ? clickedLevel - 1 : clickedLevel;
    dispatch({ type: "setTherm", thermIdx, fillCount: newFill } satisfies ThermometerAction);
  }

  // Build cell-to-therm mapping
  const cellThermMap = new Map<number, { thermIdx: number; cellInTherm: number }>();
  for (let ti = 0; ti < thermometers.length; ti++) {
    const therm = thermometers[ti]!;
    for (let ci = 0; ci < therm.cells.length; ci++) {
      const [r, c] = therm.cells[ci]!;
      cellThermMap.set(r * cols + c, { thermIdx: ti, cellInTherm: ci });
    }
  }

  const W = cols * CELL;
  const H = rows * CELL;

  // Draw thermometers as SVG paths
  function renderThermSVG() {
    const colors = ["#e53935","#8e24aa","#1e88e5","#43a047","#fb8c00","#00acc1","#6d4c41","#546e7a","#f06292"];
    return thermometers.map((therm, ti) => {
      const fillCount = getThermFill(ti);
      const color = colors[ti % colors.length]!;
      const bulb = therm.cells[0]!;
      const tip = therm.cells[therm.cells.length - 1]!;
      const bx = bulb[1] * CELL + CELL / 2;
      const by = bulb[0] * CELL + CELL / 2;
      const tx = tip[1] * CELL + CELL / 2;
      const ty = tip[0] * CELL + CELL / 2;

      // Draw path
      const pathD = therm.cells.map(([r, c], i) =>
        `${i === 0 ? "M" : "L"} ${c * CELL + CELL / 2} ${r * CELL + CELL / 2}`
      ).join(" ");

      // Draw filled mercury
      const filledPathD = therm.cells.slice(0, fillCount).map(([r, c], i) =>
        `${i === 0 ? "M" : "L"} ${c * CELL + CELL / 2} ${r * CELL + CELL / 2}`
      ).join(" ");

      return (
        <g key={ti}>
          {/* Outline */}
          <path d={pathD} stroke={color} strokeWidth={14} strokeLinecap="round" strokeLinejoin="round" fill="none" opacity={0.3} />
          {/* Mercury fill */}
          {fillCount > 0 && (
            <path d={filledPathD} stroke={color} strokeWidth={10} strokeLinecap="round" strokeLinejoin="round" fill="none" opacity={0.9} />
          )}
          {/* Bulb circle */}
          <circle cx={bx} cy={by} r={9} fill={fillCount > 0 ? color : "#fff"} stroke={color} strokeWidth={2} />
          {/* Tip flat cap hint */}
          <circle cx={tx} cy={ty} r={5} fill={color} opacity={0.5} />
        </g>
      );
    });
  }

  return (
    <div className="thermometer">
      <div className="thermometer-title">Thermometer Puzzle</div>
      <div className={`thermometer-status${won ? " win" : ""}`}>
        {won ? `Solved! Score: ${terminal?.score ?? 0}` : `Moves: ${state.moves}`}
      </div>

      <div className="thermometer-board">
        {/* Column clues */}
        <div className="thermometer-clues-top">
          {Array.from({ length: cols }, (_, c) => (
            <div key={c} className="thermometer-clue-top">{colClues[c]}</div>
          ))}
        </div>

        {/* Grid rows with row clues */}
        {Array.from({ length: rows }, (_, r) => (
          <div key={r} className="thermometer-row">
            <div className="thermometer-clue-side">{rowClues[r]}</div>
            {Array.from({ length: cols }, (_, c) => {
              const idx = r * cols + c;
              const thInfo = cellThermMap.get(idx);
              return (
                <div
                  key={c}
                  className="thermometer-cell"
                  style={{ width: CELL, height: CELL, cursor: thInfo ? "pointer" : "default" }}
                  onClick={() => thInfo && handleThermClick(thInfo.thermIdx, thInfo.cellInTherm)}
                />
              );
            })}
          </div>
        ))}

        {/* SVG overlay for thermometer drawing */}
        <svg
          className="thermometer-svg"
          width={W}
          height={H}
          style={{ left: 30, top: 24, pointerEvents: "none" }}
        >
          {renderThermSVG()}
        </svg>
      </div>

      <div className="thermometer-hint">
        Click cells on a thermometer to fill mercury from the bulb. Numbers on left/top = total filled in that row/col.
      </div>

      <div className="thermometer-btns">
        <button data-testid="hint-target-thermometer-action" onClick={() => dispatch({ type: "reset" })}>Reset</button>
      </div>
    </div>
  );
}
