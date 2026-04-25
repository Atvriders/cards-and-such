import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { TawlbwrddState, TawlbwrddSettings } from "./state.js";
import { type TawlbwrddAction, N, CENTER, getLegalMoves, isTerminal } from "./state.js";
import "./Game.css";

const CORNERS = new Set([0, N - 1, N * (N - 1), N * N - 1]);
const PIECE_EMOJI: Record<string, string> = { king: "♔", defender: "⬜", attacker: "⬛" };

export function Tawlbwrdd({ state, dispatch, onGameOver }: GameProps<TawlbwrddState, TawlbwrddSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  const isMyTurn = state.turn === "defender" && state.winner === null;
  const legalMoves = state.selected !== null ? new Set(getLegalMoves(state.board, state.selected)) : new Set<number>();

  let statusText = "", statusClass = "";
  if (state.winner === "defender") { statusText = "You win! King escaped!"; statusClass = "win"; }
  else if (state.winner === "attacker") { statusText = "Bot wins! King captured!"; statusClass = "loss"; }
  else if (!isMyTurn) statusText = "Bot (attackers) thinking...";
  else if (state.selected !== null) statusText = "Click a highlighted square to move.";
  else statusText = "Your turn — click king or defender.";

  function handleClick(i: number) {
    if (!isMyTurn) return;
    if (state.selected !== null && legalMoves.has(i)) {
      dispatch({ type: "move", from: state.selected, to: i } satisfies TawlbwrddAction);
    } else {
      dispatch({ type: "select", cell: i } satisfies TawlbwrddAction);
    }
  }

  return (
    <div className="tawlbwrdd">
      <div className={`tawlbwrdd-status ${statusClass}`}>{statusText}</div>
      <div className="tawlbwrdd-grid">
        {state.board.map((cell, i) => {
          let cls = "tb-cell";
          if (CORNERS.has(i)) cls += " corner";
          else if (i === CENTER) cls += " throne";
          if (state.selected === i) cls += " selected";
          else if (legalMoves.has(i)) cls += " legal";
          return (
            <div key={i} className={cls} onClick={() => handleClick(i)} data-testid={`cell-${i}`}>
              {cell ? PIECE_EMOJI[cell] : ""}
            </div>
          );
        })}
      </div>
      <div className="tawlbwrdd-legend">♔ King  ⬜ Defender  ⬛ Attacker | Escort king to corner to win</div>
    </div>
  );
}
