import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { WolfState, WolfSettings } from "./state.js";
import { type WolfAction, BOARD, getSheepMoves, fromIdx, toIdx, isTerminal } from "./state.js";
import "./Game.css";

export function WolfAndSheep({ state, dispatch, onGameOver }: GameProps<WolfState, WolfSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  const isMyTurn = state.turn === "sheep" && state.winner === null;
  const sheepSet = new Set(state.sheep);

  // Compute legal moves for selected sheep
  const legalMoves = new Set<number>();
  if (state.selected !== null) {
    const si = state.sheep.indexOf(state.selected);
    if (si >= 0) getSheepMoves(state, si).forEach((m) => legalMoves.add(m));
  }

  let statusText = "";
  let statusClass = "";
  if (state.winner === "sheep") { statusText = "You win! Wolf is trapped!"; statusClass = "win"; }
  else if (state.winner === "wolf") { statusText = "Bot wins! Wolf broke through!"; statusClass = "loss"; }
  else if (!isMyTurn) statusText = "Bot wolf is moving...";
  else if (state.selected !== null) statusText = "Click a green square to move the sheep.";
  else statusText = "Your turn — click a sheep to select it.";

  function handleClick(r: number, c: number) {
    if (!isMyTurn) return;
    const i = toIdx(r, c);
    if (state.selected !== null && legalMoves.has(i)) {
      dispatch({ type: "move", to: i } satisfies WolfAction);
    } else if (sheepSet.has(i)) {
      dispatch({ type: "select", pos: i } satisfies WolfAction);
    }
  }

  const cells: JSX.Element[] = [];
  for (let r = 0; r < BOARD; r++) {
    for (let c = 0; c < BOARD; c++) {
      const dark = (r + c) % 2 === 0;
      const i = dark ? toIdx(r, c) : -1;
      const isSheep = dark && sheepSet.has(i);
      const isWolf = dark && state.wolf === i;
      const isSelected = dark && state.selected === i;
      const isLegal = dark && legalMoves.has(i);
      let cls = `ws-cell ${dark ? "dark" : "light"}`;
      if (isSelected) cls += " selected";
      else if (isLegal) cls += " legal";
      cells.push(
        <div key={`${r}-${c}`} className={cls} onClick={() => handleClick(r, c)} data-testid={`cell-${r}-${c}`}>
          {isSheep ? "🐑" : isWolf ? "🐺" : ""}
        </div>
      );
    }
  }

  return (
    <div className="wolf-sheep">
      <div className={`wolf-sheep-status ${statusClass}`}>{statusText}</div>
      <div className="wolf-sheep-board">{cells}</div>
      <div className="wolf-sheep-legend">🐑 You (Sheep, move down only) | 🐺 Bot (Wolf, any diagonal)</div>
    </div>
  );
}
