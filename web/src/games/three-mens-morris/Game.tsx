import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { GameState, GameAction, ThreeMorrisSettings } from "./state.js";
import { isTerminal, ADJACENCY, POINTS } from "./state.js";
import "./Game.css";

export function ThreeMensMorrisGame({
  state,
  dispatch,
  onGameOver,
}: GameProps<GameState, ThreeMorrisSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);

  const seat = 0 as const;
  const isMyTurn = state.turn === seat && state.winner === null;
  const inPlacing = state.phase[seat] === "placing";
  const legalTargets = new Set<number>();
  if (isMyTurn && !inPlacing && state.selectedPos !== null) {
    ADJACENCY[state.selectedPos]!.filter((i) => state.board[i] === null).forEach((t2) => legalTargets.add(t2));
  }

  function clickPos(pos: number) {
    if (!isMyTurn) return;
    if (inPlacing) {
      if (state.board[pos] === null) dispatch({ type: "place", pos } as GameAction);
      return;
    }
    if (state.selectedPos !== null && legalTargets.has(pos)) {
      dispatch({ type: "move", to: pos } as GameAction);
      return;
    }
    if (state.board[pos] === seat) dispatch({ type: "select", pos } as GameAction);
  }

  let status = "Place a piece";
  let cls = "mm3-status";
  if (state.winner === 0) { status = "You win!"; cls += " mm3-win"; }
  else if (state.winner === 1) { status = "Bot wins"; cls += " mm3-loss"; }
  else if (state.winner === "draw") { status = "Draw"; cls += " mm3-draw"; }
  else if (!isMyTurn) status = "Bot is thinking...";
  else if (inPlacing) status = `Place — ${state.piecesToPlace[seat]} left`;
  else if (state.selectedPos === null) status = "Select a piece to move";
  else status = "Click an adjacent empty point";

  return (
    <div className="mm3-root">
      <div className="mm3-banner">THREE MEN'S MORRIS</div>
      <div className={cls}>{status}</div>
      <div className="mm3-board" style={{ gridTemplateColumns: "repeat(3,1fr)" }}>
        {Array.from({ length: POINTS }).map((_, i) => {
          const v = state.board[i];
          const nodeCls = [
            "mm3-cell",
            v === 0 ? "mm3-p" : v === 1 ? "mm3-b" : "",
            i === state.selectedPos ? "mm3-selected" : "",
            legalTargets.has(i) && v === null ? "mm3-legal" : "",
          ].filter(Boolean).join(" ");
          return (
            <button
              key={i}
              className={nodeCls}
              onClick={() => clickPos(i)}
              aria-label={`pos ${i}`}
            >
              {v === 0 ? "●" : v === 1 ? "○" : ""}
            </button>
          );
        })}
      </div>
      <div className="mm3-foot">Bot: {state.settings.botStrength} · Moves: {state.movesMade}</div>
    </div>
  );
}
