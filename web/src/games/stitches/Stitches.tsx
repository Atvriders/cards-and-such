import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { StitchState, StitchSettings } from "./state.js";
import type { StitchAction } from "./state.js";
import { isTerminal, stitchKey, isCrossRegion, areAdjacent4, computeRowCounts, computeColCounts } from "./state.js";
import "./Stitches.css";

const REGION_COLORS = [
  "#3498db","#e67e22","#9b59b6","#27ae60","#e74c3c","#1abc9c","#f39c12","#2c3e50",
];

const CELL = 52;

export function Stitches({ state, dispatch, onGameOver }: GameProps<StitchState, StitchSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  const { puzzle, stitches, won } = state;
  const { rows, cols, regions, rowClues, colClues } = puzzle;
  const rowCounts = computeRowCounts(puzzle, stitches);
  const colCounts = computeColCounts(puzzle, stitches);

  function handleCellClick(idx: number, dir: "right" | "down"): void {
    if (won) return;
    const neighbor = dir === "right" ? idx + 1 : idx + cols;
    if (neighbor >= rows * cols) return;
    if (!areAdjacent4(cols, idx, neighbor)) return;
    if (!isCrossRegion(puzzle, idx, neighbor)) return;
    dispatch({ type: "toggleStitch", a: idx, b: neighbor } satisfies StitchAction);
  }

  // Build stitch overlays
  const stitchOverlays: JSX.Element[] = [];
  for (const key of stitches) {
    const [as, bs] = key.split(",");
    const a = parseInt(as!), b = parseInt(bs!);
    const ra = Math.floor(a / cols), ca = a % cols;
    const rb = Math.floor(b / cols), cb = b % cols;
    const isHoriz = ra === rb;
    if (isHoriz) {
      const left = Math.min(ca, cb);
      stitchOverlays.push(
        <div key={key} className="stitches-stitch-h" style={{
          top: ra * CELL + CELL / 2 - 3,
          left: left * CELL + CELL - 4,
          width: 8,
        }} />
      );
    } else {
      const top = Math.min(ra, rb);
      stitchOverlays.push(
        <div key={key} className="stitches-stitch-v" style={{
          left: ca * CELL + CELL / 2 - 3,
          top: top * CELL + CELL - 4,
          height: 8,
        }} />
      );
    }
  }

  return (
    <div className="stitches">
      <div className="stitches-title">Stitches</div>
      <div className={`stitches-status${won ? " win" : ""}`}>
        {won
          ? `Solved! Score: ${terminal?.score ?? 0}`
          : `Click between region borders to place stitches. Moves: ${state.moves}`}
      </div>

      <div>
        <div className="stitches-col-clues">
          {colClues.map((clue, c) => (
            <div key={c} className="stitches-col-clue" style={{ color: colCounts[c] === clue ? "#27ae60" : "#555" }}>
              {clue}
            </div>
          ))}
        </div>
        <div className="stitches-row-area">
          <div className="stitches-row-clues">
            {rowClues.map((clue, r) => (
              <div key={r} className="stitches-row-clue" style={{ color: rowCounts[r] === clue ? "#27ae60" : "#555" }}>
                {clue}
              </div>
            ))}
          </div>
          <div className="stitches-grid" style={{ gridTemplateColumns: `repeat(${cols}, ${CELL}px)`, width: cols * CELL, height: rows * CELL }}>
            {Array.from({ length: rows * cols }, (_, idx) => {
              const r = Math.floor(idx / cols), c = idx % cols;
              const region = regions[idx]!;
              const color = REGION_COLORS[region % REGION_COLORS.length]!;
              // Can we click right or down to make a stitch?
              const canRight = c < cols - 1 && isCrossRegion(puzzle, idx, idx + 1);
              const canDown  = r < rows - 1 && isCrossRegion(puzzle, idx, idx + cols);
              return (
                <div
                  key={idx}
                  className="stitches-cell"
                  style={{ background: color }}
                  onClick={() => {
                    if (canRight) handleCellClick(idx, "right");
                    else if (canDown) handleCellClick(idx, "down");
                  }}
                  title={canRight ? "Click to stitch right" : canDown ? "Click to stitch down" : ""}
                >
                  {region}
                </div>
              );
            })}
            {stitchOverlays}
          </div>
        </div>
      </div>

      <div className="stitches-hint">Click a cell at a region boundary to toggle a stitch there.</div>

      <div className="stitches-btns">
        <button onClick={() => dispatch({ type: "reset" })}>Reset</button>
      </div>
    </div>
  );
}
