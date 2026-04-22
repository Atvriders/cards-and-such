import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { AlquerqueState, AlquerqueSettings, AlquerqueAction } from "./state.js";
import { isTerminal, ADJACENCY, SIZE, jumpMoves, stepMoves } from "./state.js";
import "./Game.css";

export function Alquerque({
  state,
  dispatch,
  onGameOver,
}: GameProps<AlquerqueState, AlquerqueSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  const isMyTurn = state.turn === 0 && state.winner === null;
  const selected = state.selected;

  // Compute valid moves for selected piece
  let jumpTargets = new Set<number>();
  let stepTargets = new Set<number>();
  if (isMyTurn && selected !== null) {
    const jumps = jumpMoves(state.board, selected, 0);
    jumpTargets = new Set(jumps.map(j => j.to));
    if (state.chainFrom === null && jumpTargets.size === 0) {
      stepTargets = new Set(stepMoves(state.board, selected));
    }
  }

  let statusText = "";
  let statusClass = "";
  if (state.winner === 0) { statusText = "You win! All black pieces captured."; statusClass = "win"; }
  else if (state.winner === 1) { statusText = "Bot wins!"; statusClass = "loss"; }
  else if (!isMyTurn) statusText = "Bot thinking... (Black)";
  else if (state.chainFrom !== null) statusText = "Continue jumping!";
  else if (selected !== null) statusText = "Click a target to move.";
  else statusText = "Your turn — select a White piece.";

  const cellSize = 80;
  const padding = 32;

  function handleNodeClick(pos: number) {
    if (!isMyTurn) return;
    if (jumpTargets.has(pos)) {
      dispatch({ type: "jump", to: pos } satisfies AlquerqueAction);
    } else if (stepTargets.has(pos)) {
      dispatch({ type: "move", to: pos } satisfies AlquerqueAction);
    } else if (state.board[pos] === 0) {
      dispatch({ type: "select", pos } satisfies AlquerqueAction);
    }
  }

  return (
    <div className="alquerque-game">
      <div className={`alquerque-status ${statusClass}`}>{statusText}</div>
      <div className="alquerque-counts">
        White (you): {state.board.filter(c => c === 0).length} |
        Black (bot): {state.board.filter(c => c === 1).length}
      </div>
      <div
        className="alquerque-board"
        style={{ width: (SIZE - 1) * cellSize + padding * 2, height: (SIZE - 1) * cellSize + padding * 2, position: "relative" }}
      >
        <svg style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", pointerEvents: "none" }}>
          {state.board.map((_, p) => {
            const r = Math.floor(p / SIZE); const c = p % SIZE;
            return ADJACENCY[p]!.filter(nb => nb > p).map(nb => {
              const nr = Math.floor(nb / SIZE); const nc = nb % SIZE;
              return (
                <line
                  key={`${p}-${nb}`}
                  x1={padding + c * cellSize} y1={padding + r * cellSize}
                  x2={padding + nc * cellSize} y2={padding + nr * cellSize}
                  stroke="#5a3e1b" strokeWidth={2}
                />
              );
            });
          })}
        </svg>

        {state.board.map((cell, p) => {
          const r = Math.floor(p / SIZE); const c = p % SIZE;
          const x = padding + c * cellSize;
          const y = padding + r * cellSize;
          const isSelected = p === selected;
          const isJump = jumpTargets.has(p);
          const isStep = stepTargets.has(p);

          return (
            <div
              key={p}
              className={[
                "alquerque-node",
                isSelected ? "selected" : "",
                isJump ? "jump-target" : "",
                isStep ? "step-target" : "",
              ].filter(Boolean).join(" ")}
              style={{ left: x - 22, top: y - 22, position: "absolute", width: 44, height: 44 }}
              onClick={() => handleNodeClick(p)}
            >
              {cell === 0 && <span className="alquerque-piece white">●</span>}
              {cell === 1 && <span className="alquerque-piece black">●</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
