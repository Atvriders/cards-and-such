import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { BaghChalState, BaghChalSettings, BaghChalAction } from "./state.js";
import { isTerminal, allGoatMoves } from "./state.js";
import "./Game.css";

const SIZE = 5;

export function BaghChal({
  state,
  dispatch,
  onGameOver,
}: GameProps<BaghChalState, BaghChalSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  const CELL = 90;
  const PAD = 45;
  const SVG_W = CELL * (SIZE - 1) + PAD * 2;
  const SVG_H = CELL * (SIZE - 1) + PAD * 2;

  function nodeX(c: number): number { return PAD + c * CELL; }
  function nodeY(r: number): number { return PAD + r * CELL; }
  function rowOf(p: number): number { return Math.floor(p / SIZE); }
  function colOf(p: number): number { return p % SIZE; }

  const selected = state.selected;
  let validTargets = new Set<number>();

  if (state.turn === "goat" && state.phase === "move" && selected !== null && state.winner === null) {
    const moves = allGoatMoves(state.board);
    for (const m of moves) {
      if (m.from === selected) validTargets.add(m.to);
    }
  }

  function handleNodeClick(p: number) {
    if (state.winner !== null || state.turn !== "goat") return;

    if (state.phase === "place") {
      if (state.board[p] === null) {
        dispatch({ type: "place", at: p } satisfies BaghChalAction);
      }
    } else {
      // move phase
      if (validTargets.has(p)) {
        dispatch({ type: "move", from: selected!, to: p } satisfies BaghChalAction);
      } else if (state.board[p] === "goat") {
        dispatch({ type: "select", pos: p } satisfies BaghChalAction);
      }
    }
  }

  let statusText = "";
  let statusClass = "";
  if (state.winner === "goat") { statusText = "Goats win! All tigers trapped."; statusClass = "win"; }
  else if (state.winner === "tiger") { statusText = "Tigers win! 5 goats captured."; statusClass = "loss"; }
  else if (state.turn === "tiger") { statusText = "Tigers moving..."; }
  else if (state.phase === "place") { statusText = `Place a goat (${state.goatsToPlace} left)`; }
  else if (selected !== null) { statusText = "Click a highlighted point to move."; }
  else { statusText = "Select a goat to move."; }

  // Draw diagonal lines (only at even r+c positions)
  const diagonalLines: JSX.Element[] = [];
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if ((r + c) % 2 !== 0) continue;
      const dirs: [number, number][] = [[1, 1], [1, -1]];
      for (const [dr, dc] of dirs) {
        const nr = r + dr; const nc = c + dc;
        if (nr >= 0 && nr < SIZE && nc >= 0 && nc < SIZE) {
          diagonalLines.push(
            <line
              key={`d${r},${c},${dr},${dc}`}
              x1={nodeX(c)} y1={nodeY(r)}
              x2={nodeX(nc)} y2={nodeY(nr)}
              stroke="#8B6914" strokeWidth={1}
            />
          );
        }
      }
    }
  }

  return (
    <div className="baghchal-game">
      <div className="baghchal-info">
        <span>Goats placed: {20 - state.goatsToPlace}/20</span>
        <span>Captured: {state.goatsCaptured}/5</span>
      </div>
      <div className={`baghchal-status ${statusClass}`}>{statusText}</div>
      <svg width={SVG_W} height={SVG_H} className="baghchal-svg">
        {/* Grid lines orthogonal */}
        {Array.from({ length: SIZE }, (_, i) => (
          <g key={i}>
            <line x1={nodeX(0)} y1={nodeY(i)} x2={nodeX(SIZE - 1)} y2={nodeY(i)} stroke="#8B6914" strokeWidth={1.5} />
            <line x1={nodeX(i)} y1={nodeY(0)} x2={nodeX(i)} y2={nodeY(SIZE - 1)} stroke="#8B6914" strokeWidth={1.5} />
          </g>
        ))}
        {/* Diagonal lines */}
        {diagonalLines}
        {/* Nodes */}
        {Array.from({ length: SIZE * SIZE }, (_, p) => {
          const r = rowOf(p); const c = colOf(p);
          const cx = nodeX(c); const cy = nodeY(r);
          const piece = state.board[p];
          const isSelected = selected === p;
          const isTarget = validTargets.has(p);

          return (
            <g key={p} onClick={() => handleNodeClick(p)} style={{ cursor: "pointer" }}>
              {/* Hit area */}
              <circle cx={cx} cy={cy} r={24} fill="transparent" />
              {/* Highlight */}
              {isSelected && <circle cx={cx} cy={cy} r={22} fill="#ffe066" />}
              {isTarget && <circle cx={cx} cy={cy} r={22} fill="#a8e6a0" />}
              {/* Node dot if empty */}
              {!piece && (
                <circle cx={cx} cy={cy} r={4} fill="#5a3a10" />
              )}
              {/* Tiger */}
              {piece === "tiger" && (
                <text x={cx} y={cy + 8} textAnchor="middle" fontSize={30} style={{ userSelect: "none" }}>🐯</text>
              )}
              {/* Goat */}
              {piece === "goat" && (
                <text x={cx} y={cy + 8} textAnchor="middle" fontSize={26} style={{ userSelect: "none" }}>🐐</text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
