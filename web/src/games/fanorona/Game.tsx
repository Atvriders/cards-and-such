import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { FanoronaState, FanoronaSettings, FanoronaAction } from "./state.js";
import { isTerminal, ADJACENCY, ROWS, COLS, adjacentMoves, capturingMoves, getCaptureType } from "./state.js";
import "./Game.css";

export function Fanorona({
  state,
  dispatch,
  onGameOver,
}: GameProps<FanoronaState, FanoronaSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  const isMyTurn = state.turn === 0 && state.winner === null;
  const selected = state.selected;

  // Compute valid target squares
  let validTargets = new Set<number>();
  if (isMyTurn && selected !== null) {
    if (state.chainFrom !== null) {
      validTargets = new Set(capturingMoves(state.board, selected, 0, state.usedDirections));
    } else {
      validTargets = new Set(adjacentMoves(state.board, selected));
    }
  }

  let statusText = "";
  let statusClass = "";
  if (state.winner === 0) { statusText = "You win! Captured all black pieces."; statusClass = "win"; }
  else if (state.winner === 1) { statusText = "Bot wins! All your pieces captured."; statusClass = "loss"; }
  else if (!isMyTurn) statusText = "Bot thinking... (Black)";
  else if (state.chainFrom !== null) statusText = "Continue capturing or click 'End Turn'.";
  else if (selected !== null) statusText = "Click a target square to move.";
  else statusText = "Your turn — select a White piece.";

  const cellSize = 64;
  const padding = 24;

  // Compute capture type for each valid target for coloring
  const approachTargets = new Set<number>();
  const withdrawalTargets = new Set<number>();
  if (selected !== null) {
    for (const to of validTargets) {
      const ct = getCaptureType(state.board, selected, to, 0);
      if (ct === "approach") approachTargets.add(to);
      else if (ct === "withdrawal") withdrawalTargets.add(to);
    }
  }

  function handleCellClick(pos: number) {
    if (!isMyTurn) return;
    if (validTargets.has(pos)) {
      dispatch({ type: "move", to: pos } satisfies FanoronaAction);
    } else if (state.board[pos] === 0 && state.chainFrom === null) {
      dispatch({ type: "select", pos } satisfies FanoronaAction);
    }
  }

  return (
    <div className="fanorona-game">
      <div className={`fanorona-status ${statusClass}`}>{statusText}</div>
      <div className="fanorona-counts">
        White (you): {state.board.filter(c => c === 0).length} |
        Black (bot): {state.board.filter(c => c === 1).length}
      </div>
      <div
        className="fanorona-board"
        style={{ width: (COLS - 1) * cellSize + padding * 2, height: (ROWS - 1) * cellSize + padding * 2, position: "relative" }}
      >
        {/* Lines */}
        <svg className="fanorona-svg" style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }}>
          {Array.from({ length: ROWS }, (_, r) =>
            Array.from({ length: COLS }, (_, c) => {
              const pos = r * COLS + c;
              return ADJACENCY[pos]!.filter(nb => nb > pos).map(nb => {
                const nr = Math.floor(nb / COLS); const nc = nb % COLS;
                return (
                  <line
                    key={`${pos}-${nb}`}
                    x1={padding + c * cellSize}
                    y1={padding + r * cellSize}
                    x2={padding + nc * cellSize}
                    y2={padding + nr * cellSize}
                    stroke="#8B6914"
                    strokeWidth={1.5}
                  />
                );
              });
            })
          )}
        </svg>

        {/* Intersections */}
        {state.board.map((cell, pos) => {
          const r = Math.floor(pos / COLS);
          const c = pos % COLS;
          const x = padding + c * cellSize;
          const y = padding + r * cellSize;
          const isSelected = pos === selected;
          const isApproach = approachTargets.has(pos);
          const isWithdrawal = withdrawalTargets.has(pos);
          const isTarget = validTargets.has(pos);

          return (
            <div
              key={pos}
              className={[
                "fanorona-node",
                isSelected ? "selected" : "",
                isApproach ? "approach" : "",
                isWithdrawal ? "withdrawal" : "",
                isTarget && !cell ? "target" : "",
              ].filter(Boolean).join(" ")}
              style={{ left: x - 18, top: y - 18, position: "absolute", width: 36, height: 36 }}
              onClick={() => handleCellClick(pos)}
            >
              {cell === 0 && <span className="fanorona-piece white">●</span>}
              {cell === 1 && <span className="fanorona-piece black">●</span>}
              {cell === null && isTarget && <span className="fanorona-piece hint">·</span>}
            </div>
          );
        })}
      </div>
      {state.chainFrom !== null && isMyTurn && (
        <button className="fanorona-end-btn" onClick={() => dispatch({ type: "end-chain" } satisfies FanoronaAction)}>
          End Turn (no more captures)
        </button>
      )}
    </div>
  );
}
