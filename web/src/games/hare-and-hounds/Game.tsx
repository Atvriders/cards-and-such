import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { HareState, HareSettings } from "./state.js";
import { type HareAction, COLS, ROWS, getHareMoves, isTerminal } from "./state.js";
import "./Game.css";

export function HareAndHounds({ state, dispatch, onGameOver }: GameProps<HareState, HareSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  const isMyTurn = state.turn === "hare" && state.winner === null;
  const hareMoves = isMyTurn ? new Set(getHareMoves(state.hounds, state.hare)) : new Set<number>();
  const houndSet = new Set(state.hounds);

  let statusText = "";
  let statusClass = "";
  if (state.winner === "hare") { statusText = "You win! The hare escaped!"; statusClass = "win"; }
  else if (state.winner === "hounds") { statusText = "Bot wins! Hare is trapped!"; statusClass = "loss"; }
  else if (!isMyTurn) statusText = "Bot hounds are moving...";
  else statusText = "Your turn — click a green square to move the hare.";

  function handleClick(i: number) {
    if (!isMyTurn) return;
    if (!hareMoves.has(i)) return;
    dispatch({ type: "move", to: i } satisfies HareAction);
  }

  const cells: JSX.Element[] = [];
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const i = r * COLS + c;
      const isHare = state.hare === i;
      const isHound = houndSet.has(i);
      const isLegal = hareMoves.has(i);
      let cls = "hh-cell";
      if (isLegal) cls += " legal";
      if (isHound) cls += " hound";
      cells.push(
        <div key={i} className={cls} onClick={() => handleClick(i)} data-testid={`cell-${i}`}>
          {isHare ? "🐇" : isHound ? "🐕" : ""}
        </div>
      );
    }
  }

  return (
    <div className="hare-hounds">
      <div className={`hare-hounds-status ${statusClass}`}>{statusText}</div>
      <div className="hare-hounds-grid">{cells}</div>
      <div className="hare-hounds-legend">🐇 You (Hare) — escape left past all hounds | 🐕 Bot Hounds</div>
    </div>
  );
}
