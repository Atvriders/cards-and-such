import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { RDState, RDSettings } from "./state.js";
import { type RDAction, getLegalMoves, isTerminal } from "./state.js";
import "./Game.css";

export function RussianDraughts({
  state,
  dispatch,
  onGameOver,
}: GameProps<RDState, RDSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  const isPlayerTurn = state.turn === "W" && state.winner === null;
  const legalMoves = isPlayerTurn ? getLegalMoves(state.board, "W", state.mustContinueFrom) : [];

  let statusText = "", statusClass = "";
  if (state.winner === "W") { statusText = "You win!"; statusClass = "win"; }
  else if (state.winner === "B") { statusText = "Bot wins!"; statusClass = "loss"; }
  else if (!isPlayerTurn) statusText = "Bot is thinking…";
  else if (state.selected) statusText = "Click a highlighted square.";
  else statusText = "Click one of your pieces (white).";

  const selectedTos = state.selected
    ? legalMoves.filter(m => m.from[0]===state.selected![0]&&m.from[1]===state.selected![1]).map(m => m.to)
    : [];
  const selectableSrc = new Set(legalMoves.map(m => `${m.from[0]},${m.from[1]}`));

  function countW() { let n=0; for(const row of state.board) for(const c of row) { if(c?.color==="W") n++; } return n; }
  function countB() { let n=0; for(const row of state.board) for(const c of row) { if(c?.color==="B") n++; } return n; }

  return (
    <div className="rd">
      <div className={`rd-status ${statusClass}`}>{statusText}</div>
      <div className="rd-info">
        <span>White (you): {countW()}</span>
        <span>Black (bot): {countB()}</span>
      </div>
      <div className="rd-board">
        {state.board.map((row, r) =>
          row.map((cell, c) => {
            const isDark = (r+c)%2===1;
            const key = `${r},${c}`;
            const isSelected = state.selected?.[0]===r && state.selected?.[1]===c;
            const isTarget = selectedTos.some(([tr,tc]) => tr===r&&tc===c);
            const isSel = isDark && isPlayerTurn && selectableSrc.has(key) && !isSelected;
            return (
              <div
                key={key}
                className={`rd-cell ${isDark?"dark":"light"}${isSelected?" selected":""}${isTarget?" target":""}${isSel?" selectable":""}`}
                onClick={() => dispatch({ type: "click", row: r, col: c } satisfies RDAction)}
              >
                {cell && (
                  <div className={`rd-piece ${cell.color}`}>
                    {cell.king ? "♛" : ""}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
      <div style={{ fontSize: "0.75rem", color: "#888" }}>
        Capture forward & backward · Flying kings (damki) · Promotion during chain
      </div>
    </div>
  );
}
