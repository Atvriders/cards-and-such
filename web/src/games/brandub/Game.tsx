import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { BrandubState, BrandubSettings } from "./state.js";
import { type BrandubAction, BOARD_SIZE, CENTER, getLegalMoves, isTerminal } from "./state.js";
import "./Game.css";

const N = BOARD_SIZE;
const CORNERS = new Set([0, N - 1, N * (N - 1), N * N - 1]);

const PIECE_EMOJI: Record<string, string> = {
  king: "♔",
  defender: "⬜",
  attacker: "⬛",
};

export function Brandub({ state, dispatch, onGameOver }: GameProps<BrandubState, BrandubSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  const isMyTurn = state.turn === "defender" && state.winner === null;
  let statusText = "";
  let statusClass = "";
  if (state.winner === "defender") { statusText = "You win! King escaped!"; statusClass = "win"; }
  else if (state.winner === "attacker") { statusText = "Bot wins! King captured!"; statusClass = "loss"; }
  else if (!isMyTurn) statusText = "Bot (attackers) is thinking...";
  else if (state.selected !== null) statusText = "Click a highlighted square to move.";
  else statusText = "Your turn — click a king or defender piece.";

  const legalMoves = state.selected !== null ? new Set(getLegalMoves(state.board, state.selected)) : new Set<number>();

  function handleClick(i: number) {
    if (!isMyTurn) return;
    if (state.selected !== null && legalMoves.has(i)) {
      dispatch({ type: "move", from: state.selected, to: i } satisfies BrandubAction);
    } else {
      dispatch({ type: "select", cell: i } satisfies BrandubAction);
    }
  }

  return (
    <div className="brandub">
      <div className={`brandub-status ${statusClass}`}>{statusText}</div>
      <div className="brandub-grid">
        {state.board.map((cell, i) => {
          const isCorner = CORNERS.has(i);
          const isThrone = i === CENTER;
          const isSelected = state.selected === i;
          const isLegal = legalMoves.has(i);
          let cls = "brandub-cell";
          if (isCorner) cls += " corner";
          else if (isThrone) cls += " throne";
          if (isSelected) cls += " selected";
          if (isLegal) cls += " legal";
          return (
            <div key={i} className={cls} onClick={() => handleClick(i)} data-testid={`cell-${i}`}>
              {cell ? PIECE_EMOJI[cell] : ""}
            </div>
          );
        })}
      </div>
      <div className="brandub-legend">♔ King  ⬜ Defender  ⬛ Attacker | Corners: dark squares</div>
    </div>
  );
}
