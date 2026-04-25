import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { SeegaState, SeegaSettings } from "./state.js";
import { type SeegaAction, isTerminal, CENTER, SIZE } from "./state.js";
import "./Game.css";

// Compute legal move destinations from selected piece
function legalDests(board: (string | null)[], sel: number): number[] {
  const [r, c] = [Math.floor(sel / SIZE), sel % SIZE];
  const ns: number[] = [];
  for (const [dr, dc] of [[-1,0],[1,0],[0,-1],[0,1]] as const) {
    const nr = r+dr, nc = c+dc;
    if (nr < 0 || nr >= SIZE || nc < 0 || nc >= SIZE) continue;
    const ni = nr * SIZE + nc;
    if (board[ni] === null && ni !== CENTER) ns.push(ni);
  }
  return ns;
}

export function Seega({
  state,
  dispatch,
  onGameOver,
}: GameProps<SeegaState, SeegaSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  const isPlayerTurn = state.turn === "P" && state.winner === null;
  const dests = state.selected !== null ? legalDests(state.board, state.selected) : [];

  let statusText = "";
  let statusClass = "";
  if (state.winner === "P") { statusText = "You win!"; statusClass = "win"; }
  else if (state.winner === "B") { statusText = "Bot wins!"; statusClass = "loss"; }
  else if (!isPlayerTurn) statusText = "Bot is thinking…";
  else if (state.phase === "place") {
    statusText = state.placeBuf === null
      ? `Place 1st piece (${state.pHand} left).`
      : `Place 2nd piece (${state.pHand} left).`;
  } else if (state.selected !== null) statusText = "Click an adjacent empty cell.";
  else statusText = "Click a piece to select.";

  function handleClick(pos: number) {
    if (!isPlayerTurn) return;
    if (state.phase === "place") {
      dispatch({ type: "place", pos } satisfies SeegaAction);
      return;
    }
    if (state.selected !== null && dests.includes(pos)) {
      dispatch({ type: "moveTo", pos } satisfies SeegaAction);
    } else if (state.board[pos] === "P") {
      dispatch({ type: "select", pos } satisfies SeegaAction);
    }
  }

  function getCellClass(pos: number): string {
    if (pos === CENTER) return "center";
    if (!isPlayerTurn) return "";
    if (state.phase === "place") {
      if (pos === state.placeBuf) return "buf";
      if (state.board[pos] === null) return "selectable";
    } else {
      if (state.selected === pos) return "selected";
      if (dests.includes(pos)) return "target";
      if (state.board[pos] === "P") return "selectable";
    }
    return "";
  }

  return (
    <div className="seega">
      <div className={`seega-status ${statusClass}`}>{statusText}</div>
      <div className="seega-info">
        <span>Your pieces: {state.board.filter((c)=>c==="P").length} (hand: {state.pHand})</span>
        <span>Bot pieces: {state.board.filter((c)=>c==="B").length} (hand: {state.bHand})</span>
      </div>
      <div className="seega-board">
        {state.board.map((cell, pos) => (
          <div
            key={pos}
            className={`seega-cell ${getCellClass(pos)}`}
            onClick={() => handleClick(pos)}
          >
            {cell === "P" && <div className="seega-piece P" />}
            {cell === "B" && <div className="seega-piece B" />}
            {pos === CENTER && cell === null && <span style={{fontSize:"0.7rem",color:"#8a6020"}}>★</span>}
          </div>
        ))}
      </div>
      <div style={{ fontSize: "0.75rem", color: "#888" }}>
        Place 2 per turn · Move ortho · Capture by sandwiching
      </div>
    </div>
  );
}
