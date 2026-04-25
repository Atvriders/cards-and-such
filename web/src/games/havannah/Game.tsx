import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { HavannahState, HavannahSettings } from "./state.js";
import { type HavannahAction, BASE, hexCells, isTerminal } from "./state.js";
import "./Game.css";

const CELLS = hexCells(BASE);
const N = BASE - 1;
const maxR = 2 * N;

function isCorner(r: number, c: number): boolean {
  const colStart = Math.max(0, N - r);
  const colEnd = Math.min(2 * N, 3 * N - r);
  return (r === 0 || r === maxR) && (c === colStart || c === colEnd) ||
    (r === N && (c === 0 || c === 2 * N));
}

function isEdge(r: number, c: number): boolean {
  if (isCorner(r, c)) return false;
  const colStart = Math.max(0, N - r);
  const colEnd = Math.min(2 * N, 3 * N - r);
  return r === 0 || r === maxR || c === colStart || c === colEnd;
}

// Build rows for rendering
function buildRows(): Array<Array<{ r: number; c: number; idx: number }>> {
  const rowMap = new Map<number, Array<{ r: number; c: number; idx: number }>>();
  CELLS.forEach(([r, c], i) => {
    if (!rowMap.has(r)) rowMap.set(r, []);
    rowMap.get(r)!.push({ r, c, idx: i });
  });
  return Array.from(rowMap.entries()).sort((a, b) => a[0] - b[0]).map(([, row]) =>
    row.sort((a, b) => a.c - b.c)
  );
}

const ROWS = buildRows();

export function Havannah({ state, dispatch, onGameOver }: GameProps<HavannahState, HavannahSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  const isMyTurn = state.turn === 0 && state.winner === null;

  let statusText = "";
  let statusClass = "";
  if (state.winner === 0) { statusText = "You win! Ring, bridge, or fork!"; statusClass = "win"; }
  else if (state.winner === 1) { statusText = "Bot wins!"; statusClass = "loss"; }
  else if (!isMyTurn) statusText = "Bot is placing...";
  else statusText = "Your turn — click any empty hex.";

  function handleClick(i: number) {
    if (!isMyTurn || state.board[i] !== null) return;
    dispatch({ type: "place", cell: i } satisfies HavannahAction);
  }

  return (
    <div className="havannah">
      <div className={`havannah-status ${statusClass}`}>{statusText}</div>
      <div className="havannah-board">
        {ROWS.map((row, ri) => (
          <div key={ri} className="havannah-row" style={{ marginLeft: `${Math.abs(N - row[0]!.r) * 19}px` }}>
            {row.map(({ r, c, idx }) => {
              const cell = state.board[idx];
              let cls = "havannah-hex";
              if (isCorner(r, c)) cls += " corner";
              else if (isEdge(r, c)) cls += " edge";
              if (cell === 0) cls += " p0";
              else if (cell === 1) cls += " p1";
              if (state.lastMove === idx) cls += " last";
              return (
                <div key={idx} className={cls} onClick={() => handleClick(idx)} data-testid={`hex-${idx}`}>
                  {cell === 0 ? "●" : cell === 1 ? "○" : ""}
                </div>
              );
            })}
          </div>
        ))}
      </div>
      <div className="havannah-legend">Win by: Ring (loop), Bridge (2 corners), or Fork (3 edges) | ● You | ○ Bot | Orange=corner, tan=edge</div>
    </div>
  );
}
