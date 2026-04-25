import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { PCState, PCSettings } from "./state.js";
import { type PCAction, getLegalMoves, isTerminal } from "./state.js";
import "./Game.css";

export function PoolCheckers({
  state,
  dispatch,
  onGameOver,
}: GameProps<PCState, PCSettings>): JSX.Element {
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
    ? legalMoves.filter(m => m.from[0]===state.selected![0]&&m.from[1]===state.selected![1]).map(m=>m.to)
    : [];
  const selectableSrc = new Set(legalMoves.map(m => `${m.from[0]},${m.from[1]}`));

  function countW(){let n=0;for(const row of state.board)for(const c of row){if(c?.color==="W")n++;}return n;}
  function countB(){let n=0;for(const row of state.board)for(const c of row){if(c?.color==="B")n++;}return n;}

  return (
    <div className="pc">
      <div className={`pc-status ${statusClass}`}>{statusText}</div>
      <div className="pc-info">
        <span>White (you): {countW()}</span>
        <span>Black (bot): {countB()}</span>
      </div>
      <div className="pc-board">
        {state.board.map((row,r) =>
          row.map((cell,c) => {
            const isDark=(r+c)%2===1;
            const key=`${r},${c}`;
            const isSel=state.selected?.[0]===r&&state.selected?.[1]===c;
            const isTgt=selectedTos.some(([tr,tc])=>tr===r&&tc===c);
            const isSelectable=isDark&&isPlayerTurn&&selectableSrc.has(key)&&!isSel;
            return (
              <div
                key={key}
                className={`pc-cell ${isDark?"dark":"light"}${isSel?" selected":""}${isTgt?" target":""}${isSelectable?" selectable":""}`}
                onClick={() => dispatch({ type: "click", row: r, col: c } satisfies PCAction)}
              >
                {cell && <div className={`pc-piece ${cell.color}`}>{cell.king?"♛":""}</div>}
              </div>
            );
          })
        )}
      </div>
      <div style={{ fontSize: "0.75rem", color: "#888" }}>
        Pool Checkers: men capture in all 4 directions · flying kings
      </div>
    </div>
  );
}
