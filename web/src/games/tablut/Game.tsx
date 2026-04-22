import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { TablutState, TablutSettings, TablutAction } from "./state.js";
import { isTerminal, legalMovesFrom, SIZE } from "./state.js";
import "./Game.css";

export function Tablut({
  state,
  dispatch,
  onGameOver,
}: GameProps<TablutState, TablutSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  const isMyTurn = state.turn === 0 && state.winner === null;
  const legalTargets = state.selected !== null ? new Set(legalMovesFrom(state.board, state.selected)) : new Set<number>();
  const isCenter = (pos: number) => Math.floor(pos / SIZE) === 4 && pos % SIZE === 4;

  let statusText = "";
  let statusClass = "";
  if (state.winner === 0) { statusText = "You win! King reached the edge."; statusClass = "win"; }
  else if (state.winner === 1) { statusText = "Bot wins! King was captured."; statusClass = "loss"; }
  else if (!isMyTurn) statusText = "Bot thinking... (Attackers)";
  else if (state.selected !== null) statusText = "Click a highlighted square to move.";
  else statusText = "Your turn — select a Defender or King.";

  const cellSize = 52;

  function renderPiece(cell: string | null, pos: number) {
    if (cell === "K") return <span className="piece king" key={pos}>♔</span>;
    if (cell === "D") return <span className="piece defender" key={pos}>●</span>;
    if (cell === "A") return <span className="piece attacker" key={pos}>●</span>;
    return null;
  }

  return (
    <div className="tablut-game">
      <div className={`tablut-status ${statusClass}`}>{statusText}</div>
      <div className="tablut-legend">
        <span className="leg-def">■ Defender (you)</span>
        <span className="leg-king">♔ King (you) — escape to edge</span>
        <span className="leg-atk">■ Attacker (bot)</span>
      </div>
      <div className="tablut-board" style={{ gridTemplateColumns: `repeat(${SIZE}, ${cellSize}px)` }}>
        {state.board.map((cell, pos) => {
          const r = Math.floor(pos / SIZE);
          const c = pos % SIZE;
          const isSelected = state.selected === pos;
          const isTarget = legalTargets.has(pos);
          const isEdge = r === 0 || r === SIZE - 1 || c === 0 || c === SIZE - 1;

          const cls = [
            "tablut-cell",
            (r + c) % 2 === 0 ? "light" : "dark",
            isCenter(pos) ? "throne" : "",
            isEdge ? "edge" : "",
            isSelected ? "selected" : "",
            isTarget ? "target" : "",
          ].filter(Boolean).join(" ");

          return (
            <div
              key={pos}
              className={cls}
              style={{ width: cellSize, height: cellSize }}
              onClick={() => {
                if (!isMyTurn) return;
                if (isTarget && state.selected !== null) {
                  dispatch({ type: "move", to: pos } satisfies TablutAction);
                } else if (cell === "D" || cell === "K") {
                  dispatch({ type: "select", pos } satisfies TablutAction);
                }
              }}
            >
              {renderPiece(cell, pos)}
            </div>
          );
        })}
      </div>
      <div className="tablut-counts">
        Defenders: {state.board.filter(c => c === "D").length + (state.board.includes("K") ? 1 : 0)} |
        Attackers: {state.board.filter(c => c === "A").length}
      </div>
    </div>
  );
}
