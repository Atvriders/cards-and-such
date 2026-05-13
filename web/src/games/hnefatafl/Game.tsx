import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { HnefataflState, HnefataflSettings, HnefataflAction } from "./state.js";
import { isTerminal, legalMovesFrom, SIZE, CORNERS } from "./state.js";
import "./Game.css";

export function Hnefatafl({
  state,
  dispatch,
  onGameOver,
}: GameProps<HnefataflState, HnefataflSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  const isMyTurn = state.turn === 0 && state.winner === null;
  const legalTargets = state.selected !== null ? new Set(legalMovesFrom(state.board, state.selected)) : new Set<number>();
  const cornerSet = new Set(CORNERS.map(([r, c]) => r * SIZE + c));

  let statusText = "";
  let statusClass = "";
  if (state.winner === 0) { statusText = "You win! King escaped to a corner."; statusClass = "win"; }
  else if (state.winner === 1) { statusText = "Bot wins! King was captured."; statusClass = "loss"; }
  else if (!isMyTurn) statusText = "Bot thinking... (Attackers)";
  else if (state.selected !== null) statusText = "Click a highlighted square to move.";
  else statusText = "Your turn — select a Defender or King.";

  const cellSize = 44;

  return (
    <div className="hnefatafl-game fade-in">
      <div className={`hnefatafl-status ${statusClass}`}>{statusText}</div>
      <div className="hnefatafl-legend">
        <span className="legend-def">■ Defender (you)</span>
        <span className="legend-king">♔ King (you)</span>
        <span className="legend-atk">■ Attacker (bot)</span>
      </div>
      <div className="hnefatafl-board" style={{ gridTemplateColumns: `repeat(${SIZE}, ${cellSize}px)` }}>
        {state.board.map((cell, pos) => {
          const r = Math.floor(pos / SIZE);
          const c = pos % SIZE;
          const isCornerCell = cornerSet.has(pos);
          const isCenter = r === 5 && c === 5;
          const isSelected = state.selected === pos;
          const isTarget = legalTargets.has(pos);
          const cellClass = [
            "hnefatafl-cell",
            (r + c) % 2 === 0 ? "light" : "dark",
            isCornerCell ? "corner" : "",
            isCenter ? "center" : "",
            isSelected ? "selected" : "",
            isTarget ? "target" : "",
          ].filter(Boolean).join(" ");

          return (
            <div
              key={pos}
              className={cellClass}
              style={{ width: cellSize, height: cellSize }}
              onClick={() => {
                if (!isMyTurn) return;
                if (isTarget && state.selected !== null) {
                  dispatch({ type: "move", to: pos } satisfies HnefataflAction);
                } else if (cell === "D" || cell === "K") {
                  dispatch({ type: "select", pos } satisfies HnefataflAction);
                }
              }}
            >
              {cell === "K" && <span className="piece king">♔</span>}
              {cell === "D" && <span className="piece defender">●</span>}
              {cell === "A" && <span className="piece attacker">●</span>}
            </div>
          );
        })}
      </div>
      <div className="hnefatafl-counts">
        Defenders: {state.board.filter(c => c === "D").length + (state.board.includes("K") ? 1 : 0)} |
        Attackers: {state.board.filter(c => c === "A").length}
      </div>
    </div>
  );
}
