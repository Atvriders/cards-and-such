import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { MorrisState, MorrisSettings } from "./state.js";
import { type MorrisAction, ADJACENCY, MILLS, canRemove, formsNewMill } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

// Visual positions for each of the 24 intersections (x%, y% on 320x320 board)
const POS_COORDS: ReadonlyArray<[number, number]> = [
  [0, 0], [50, 0], [100, 0],   // 0,1,2 outer top
  [100, 50], [100, 100],        // 3,4 outer right
  [50, 100], [0, 100], [0, 50], // 5,6,7 outer bottom/left
  [14, 14], [50, 14], [86, 14], // 8,9,10 middle top
  [86, 50], [86, 86],           // 11,12 middle right
  [50, 86], [14, 86], [14, 50], // 13,14,15 middle bottom/left
  [29, 29], [50, 29], [71, 29], // 16,17,18 inner top
  [71, 50], [71, 71],           // 19,20 inner right
  [50, 71], [29, 71], [29, 50], // 21,22,23 inner bottom/left
];

function toPixel(pct: number): number {
  return (pct / 100) * 300 + 10;
}

export function NineMensMorris({
  state,
  dispatch,
  onGameOver,
}: GameProps<MorrisState, MorrisSettings>): JSX.Element {
  const terminal = isTerminal(state);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  const seat = 0 as const;
  const opp = 1 as const;
  const isMyTurn = state.turn === seat && state.winner === null;

  // Compute legal targets for selected piece
  const legalTargets = new Set<number>();
  if (isMyTurn && !state.mustRemove && state.selectedPos !== null && state.phase[seat] !== "placing") {
    const from = state.selectedPos;
    const flying = state.phase[seat] === "flying";
    const targets = flying
      ? state.board.map((_, i) => i).filter((i) => state.board[i] === null)
      : ADJACENCY[from]!.filter((i) => state.board[i] === null);
    targets.forEach((t) => legalTargets.add(t));
  }

  function handlePosClick(pos: number) {
    if (!isMyTurn) return;

    if (state.mustRemove) {
      if (canRemove(state.board, pos, opp)) {
        dispatch({ type: "remove", pos } satisfies MorrisAction);
      }
      return;
    }

    if (state.phase[seat] === "placing") {
      if (state.board[pos] === null) {
        dispatch({ type: "place", pos } satisfies MorrisAction);
      }
      return;
    }

    // Moving/flying phase
    if (state.selectedPos !== null && legalTargets.has(pos)) {
      dispatch({ type: "move", to: pos } satisfies MorrisAction);
      return;
    }

    if (state.board[pos] === seat) {
      dispatch({ type: "select", pos } satisfies MorrisAction);
    }
  }

  // Draw board lines using SVG
  const lines: Array<[number, number]> = [];
  const seen = new Set<string>();
  for (let i = 0; i < 24; i++) {
    for (const j of ADJACENCY[i]!) {
      const key = [Math.min(i, j), Math.max(i, j)].join(",");
      if (!seen.has(key)) {
        seen.add(key);
        lines.push([i, j]);
      }
    }
  }

  // Highlight mills
  const millPositions = new Set<number>();
  for (const [a, b, c] of MILLS) {
    if (state.board[a] !== null && state.board[a] === state.board[b] && state.board[b] === state.board[c]) {
      millPositions.add(a); millPositions.add(b); millPositions.add(c);
    }
  }

  let statusText = "";
  let statusClass = "";
  if (state.winner === seat) { statusText = "You win!"; statusClass = "win"; }
  else if (state.winner === opp) { statusText = "Bot wins!"; statusClass = "loss"; }
  else if (state.mustRemove && state.turn === seat) statusText = "Mill! Remove an opponent piece (red).";
  else if (!isMyTurn) statusText = "Bot is thinking...";
  else if (state.phase[seat] === "placing") statusText = `Placing phase — place a piece (${state.piecesToPlace[seat]} left).`;
  else if (state.selectedPos === null) statusText = "Select one of your pieces to move.";
  else statusText = "Click a highlighted spot to move there.";

  return (
    <div className="morris">
      <div className={`morris-status ${statusClass}`}>{statusText}</div>
      <div className="morris-counts">
        <span>You: {state.piecesOnBoard[seat] + state.piecesToPlace[seat]} pieces</span>
        <span>Bot: {state.piecesOnBoard[opp] + state.piecesToPlace[opp]} pieces</span>
      </div>
      <div className="morris-board">
        <svg viewBox="0 0 320 320">
          {lines.map(([a, b]) => {
            const [ax, ay] = POS_COORDS[a]!;
            const [bx, by] = POS_COORDS[b]!;
            return (
              <line
                key={`${a}-${b}`}
                x1={toPixel(ax)} y1={toPixel(ay)}
                x2={toPixel(bx)} y2={toPixel(by)}
                stroke="#8b7355" strokeWidth="3"
              />
            );
          })}
        </svg>
        {POS_COORDS.map(([px, py], i) => {
          const cell = state.board[i];
          let cls = "morris-pos";
          if (cell === 0) cls += " player";
          else if (cell === 1) cls += " bot";
          if (i === state.selectedPos) cls += " selected";
          else if (legalTargets.has(i) && cell === null) cls += " legal";
          else if (state.mustRemove && state.turn === seat && canRemove(state.board, i, opp)) cls += " removable";
          if (millPositions.has(i)) cls += " mill";

          return (
            <button
              key={i}
              className={cls}
              style={{ left: `${toPixel(px)}px`, top: `${toPixel(py)}px` }}
              onClick={() => handlePosClick(i)}
              aria-label={`position ${i}`}
              data-testid={`morris-pos-${i}`}
            />
          );
        })}
      </div>
    </div>
  );
}
