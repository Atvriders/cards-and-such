import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { ShobuState } from "./state.js";
import { isTerminal, getPassiveMoves, tryAggressive } from "./state.js";
import "./Game.css";

type ShobuSettings = Record<string, never>;

const CELL = 44;
const PAD = 8;
const BOARD_GAP = 16;
const BOARD_SIZE = CELL * 4 + PAD * 2;

// Board layout: [0,1] top row, [2,3] bottom row
function boardOffset(bIdx: number): { ox: number; oy: number } {
  const col = bIdx % 2;
  const row = Math.floor(bIdx / 2);
  return {
    ox: col * (BOARD_SIZE + BOARD_GAP),
    oy: row * (BOARD_SIZE + BOARD_GAP),
  };
}

function rcOf(idx: number): [number, number] { return [Math.floor(idx / 4), idx % 4]; }
function idxOf(r: number, c: number): number { return r * 4 + c; }

export function ShobuGame({ state, dispatch, onGameOver }: GameProps<ShobuState, ShobuSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  const isHumanTurn = state.turn === 0 && state.winner === null;
  const humanHomeBoards = [2, 3];
  const humanAggrBoards = [0, 1];

  // Compute highlights based on phase
  function getCellFill(bIdx: number, cellIdx: number): string {
    const cell = state.boards[bIdx]![cellIdx];
    const isHome = humanHomeBoards.includes(bIdx);
    const isAggr = humanAggrBoards.includes(bIdx);

    if (state.phase === "passive") {
      if (isHome && cell === 0) return "#ffe";
      return (Math.floor(cellIdx / 4) + (cellIdx % 4)) % 2 === 0 ? "#f5e8c8" : "#e0c890";
    } else {
      // aggressive phase
      if (isAggr && cell === 0) return "#cfc";
      return (Math.floor(cellIdx / 4) + (cellIdx % 4)) % 2 === 0 ? "#f5e8c8" : "#e0c890";
    }
  }

  function handleCellClick(bIdx: number, cellIdx: number) {
    if (!isHumanTurn) return;
    const cell = state.boards[bIdx]![cellIdx];

    if (state.phase === "passive") {
      if (!humanHomeBoards.includes(bIdx)) return;
      if (cell === 0) {
        if (state.passiveFrom === cellIdx && state.passiveBoard === bIdx) {
          dispatch({ type: "passive-select", boardIdx: bIdx, from: cellIdx });
        } else {
          dispatch({ type: "passive-select", boardIdx: bIdx, from: cellIdx });
        }
      } else if (state.passiveFrom !== null && state.passiveBoard === bIdx && cell === null) {
        dispatch({ type: "passive-move", to: cellIdx });
      }
    } else {
      // aggressive phase
      if (!humanAggrBoards.includes(bIdx)) return;
      if (cell === 0) {
        dispatch({ type: "aggressive-select", boardIdx: bIdx, from: cellIdx });
      } else if (state.selected !== null && state.passiveDr !== null) {
        // Try to confirm aggressive move target
        const from = state.selected;
        const [fr, fc] = rcOf(from);
        const [tr, tc] = rcOf(cellIdx);
        // Check direction matches
        if (
          Math.sign(tr - fr) === state.passiveDr &&
          Math.sign(tc - fc) === state.passiveDc &&
          Math.max(Math.abs(tr - fr), Math.abs(tc - fc)) === state.passiveDist
        ) {
          dispatch({ type: "aggressive-move", to: cellIdx });
        }
      }
    }
  }

  // For aggressive phase: compute valid destination
  let aggrTarget: number | null = null;
  if (state.phase === "aggressive" && state.selected !== null && state.passiveDr !== null && state.passiveDist !== null) {
    const [fr, fc] = rcOf(state.selected);
    const nr = fr + state.passiveDr * state.passiveDist!;
    const nc = fc + state.passiveDc! * state.passiveDist!;
    if (nr >= 0 && nr < 4 && nc >= 0 && nc < 4) aggrTarget = idxOf(nr, nc);
  }

  let statusText = "";
  let statusClass = "";
  if (state.winner === 0) { statusText = "You win!"; statusClass = "win"; }
  else if (state.winner === 1) { statusText = "Bot wins!"; statusClass = "loss"; }
  else if (!isHumanTurn) statusText = "Bot thinking…";
  else if (state.phase === "passive") {
    if (state.passiveFrom === null) statusText = "PASSIVE: select a stone on your home board (bottom 2).";
    else statusText = "PASSIVE: click destination on same home board.";
  } else {
    if (state.selected === null) statusText = "AGGRESSIVE: select a stone on opponent's board (top 2).";
    else statusText = "AGGRESSIVE: the move direction is locked — click the destination.";
  }

  const totalW = BOARD_SIZE * 2 + BOARD_GAP + PAD * 2;
  const totalH = BOARD_SIZE * 2 + BOARD_GAP + PAD * 2;

  return (
    <div className="shobu">
      <div className={`shobu-status ${statusClass}`}>{statusText}</div>
      {state.phase === "aggressive" && state.passiveDr !== null && (
        <div className="shobu-dir">
          Direction locked: ({state.passiveDr > 0 ? "↓" : state.passiveDr < 0 ? "↑" : "·"}{state.passiveDc! > 0 ? "→" : state.passiveDc! < 0 ? "←" : "·"}) × {state.passiveDist}
        </div>
      )}
      <svg className="shobu-svg" width={totalW + PAD * 2} height={totalH + PAD * 2}
        viewBox={`-${PAD} -${PAD} ${totalW + PAD * 2} ${totalH + PAD * 2}`}>
        {/* Divider lines */}
        <line x1={BOARD_SIZE + BOARD_GAP / 2} y1={0} x2={BOARD_SIZE + BOARD_GAP / 2} y2={totalH} stroke="#555" strokeWidth={3} strokeDasharray="6,4" />
        <line x1={0} y1={BOARD_SIZE + BOARD_GAP / 2} x2={totalW} y2={BOARD_SIZE + BOARD_GAP / 2} stroke="#555" strokeWidth={3} strokeDasharray="6,4" />
        <text x={BOARD_SIZE / 2} y={-4} textAnchor="middle" fontSize={11} fill="#666">Bot Home</text>
        <text x={BOARD_SIZE + BOARD_GAP + BOARD_SIZE / 2} y={-4} textAnchor="middle" fontSize={11} fill="#666">Bot Home</text>
        <text x={BOARD_SIZE / 2} y={totalH + 14} textAnchor="middle" fontSize={11} fill="#444">Your Home</text>
        <text x={BOARD_SIZE + BOARD_GAP + BOARD_SIZE / 2} y={totalH + 14} textAnchor="middle" fontSize={11} fill="#444">Your Home</text>

        {[0, 1, 2, 3].map((bIdx) => {
          const { ox, oy } = boardOffset(bIdx);
          const isHome = humanHomeBoards.includes(bIdx);
          const isAggr = humanAggrBoards.includes(bIdx);
          return (
            <g key={bIdx} transform={`translate(${ox + PAD}, ${oy + PAD})`}>
              {/* Board background */}
              <rect x={0} y={0} width={CELL * 4} height={CELL * 4}
                fill={isHome ? "#f8f0d8" : "#e8f0f8"} stroke={isHome ? "#8b6020" : "#206080"} strokeWidth={2} rx={4} />
              {/* Cells */}
              {Array.from({ length: 16 }, (_, i) => {
                const r = Math.floor(i / 4), c = i % 4;
                const x = c * CELL, y = r * CELL;
                const cell = state.boards[bIdx]![i];
                const isSel = (state.passiveBoard === bIdx && state.passiveFrom === i) ||
                  (state.phase === "aggressive" && state.selected === i && isAggr && state.passiveBoard === bIdx);
                const isAggrSel = state.phase === "aggressive" && isAggr && state.selected === i;
                const isAggrTarget = state.phase === "aggressive" && isAggr && aggrTarget === i && state.passiveBoard === bIdx;
                return (
                  <g key={i} onClick={() => handleCellClick(bIdx, i)} style={{ cursor: isHumanTurn ? "pointer" : "default" }}>
                    <rect x={x + 1} y={y + 1} width={CELL - 2} height={CELL - 2}
                      fill={isSel || isAggrSel ? "#ffe88a" : isAggrTarget ? "#aaffaa" : getCellFill(bIdx, i)}
                      stroke={(r + c) % 2 === 0 ? "#c8a060" : "#b08040"} strokeWidth={0.5} />
                    {cell === 0 && <circle cx={x + CELL / 2} cy={y + CELL / 2} r={16} fill="#222" stroke="#555" strokeWidth={1.5} />}
                    {cell === 1 && <circle cx={x + CELL / 2} cy={y + CELL / 2} r={16} fill="#f0f0f0" stroke="#999" strokeWidth={1.5} />}
                  </g>
                );
              })}
            </g>
          );
        })}
      </svg>
      <div className="shobu-btns">
        {isHumanTurn && (
          <button className="shobu-reset-btn" onClick={() => dispatch({ type: "reset-phase" })}>↺ Reset Turn</button>
        )}
      </div>
      <div className="shobu-legend">
        <span className="shobu-dark">● You (dark)</span>
        <span className="shobu-light">● Bot (light)</span>
      </div>
    </div>
  );
}
