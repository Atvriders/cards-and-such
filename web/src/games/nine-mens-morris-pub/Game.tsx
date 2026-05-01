import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { PubState, PubAction, PubSettings } from "./state.js";
import { isTerminal, ADJACENCY, MILLS, canRemove } from "./state.js";
import "./Game.css";

const POS_COORDS: ReadonlyArray<[number, number]> = [
  [0, 0], [50, 0], [100, 0],
  [100, 50], [100, 100],
  [50, 100], [0, 100], [0, 50],
  [14, 14], [50, 14], [86, 14],
  [86, 50], [86, 86],
  [50, 86], [14, 86], [14, 50],
  [29, 29], [50, 29], [71, 29],
  [71, 50], [71, 71],
  [50, 71], [29, 71], [29, 50],
];

function px(p: number): number { return (p / 100) * 300 + 16; }

export function NineMensMorrisPubGame({
  state,
  dispatch,
  onGameOver,
}: GameProps<PubState, PubSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);

  const seat = 0 as const;
  const opp = 1 as const;
  const isMyTurn = state.turn === seat && state.winner === null;

  const legalTargets = new Set<number>();
  if (isMyTurn && !state.mustRemove && state.selectedPos !== null && state.phase[seat] !== "placing") {
    const from = state.selectedPos;
    ADJACENCY[from]!.filter((i) => state.board[i] === null).forEach((t2) => legalTargets.add(t2));
  }

  function clickPos(pos: number) {
    if (!isMyTurn) return;
    if (state.mustRemove) {
      if (canRemove(state.board, pos, opp)) {
        dispatch({ type: "remove", pos } as PubAction);
      }
      return;
    }
    if (state.phase[seat] === "placing") {
      if (state.board[pos] === null) dispatch({ type: "place", pos } as PubAction);
      return;
    }
    if (state.selectedPos !== null && legalTargets.has(pos)) {
      dispatch({ type: "move", to: pos } as PubAction);
      return;
    }
    if (state.board[pos] === seat) dispatch({ type: "select", pos } as PubAction);
  }

  const lines: Array<[number, number]> = [];
  const seen = new Set<string>();
  for (let i = 0; i < 24; i++) {
    for (const j of ADJACENCY[i]!) {
      const k = [Math.min(i, j), Math.max(i, j)].join(",");
      if (!seen.has(k)) { seen.add(k); lines.push([i, j]); }
    }
  }

  const millPos = new Set<number>();
  for (const [a, b, c] of MILLS) {
    if (state.board[a] !== null && state.board[a] === state.board[b] && state.board[b] === state.board[c]) {
      millPos.add(a); millPos.add(b); millPos.add(c);
    }
  }

  let status = "Place a piece";
  let cls = "mm9pub-status";
  if (state.winner === seat) { status = "You win!"; cls += " mm9pub-win"; }
  else if (state.winner === opp) { status = "Bot wins"; cls += " mm9pub-loss"; }
  else if (state.mustRemove && state.turn === seat) status = "Mill! Remove a bot piece (red).";
  else if (!isMyTurn) status = "Bot is thinking...";
  else if (state.phase[seat] === "placing") status = `Place a piece (${state.piecesToPlace[seat]} left)`;
  else if (state.selectedPos === null) status = "Select one of your pieces to move";
  else status = "Click a highlighted spot";

  return (
    <div className="mm9pub-root">
      <div className="mm9pub-banner">PUB RULES · NO FLYING</div>
      <div className={cls}>{status}</div>
      <div className="mm9pub-counts">
        <span>You: {state.piecesOnBoard[seat] + state.piecesToPlace[seat]}</span>
        <span>Bot: {state.piecesOnBoard[opp] + state.piecesToPlace[opp]}</span>
      </div>
      <div className="mm9pub-board">
        <svg viewBox="0 0 332 332">
          {lines.map(([a, b]) => {
            const [ax, ay] = POS_COORDS[a]!;
            const [bx, by] = POS_COORDS[b]!;
            return (
              <line
                key={`${a}-${b}`}
                x1={px(ax)} y1={px(ay)} x2={px(bx)} y2={px(by)}
                stroke="#a17b3f" strokeWidth="3"
              />
            );
          })}
        </svg>
        {POS_COORDS.map(([px2, py], i) => {
          const cell = state.board[i];
          let nodeCls = "mm9pub-pos";
          if (cell === 0) nodeCls += " mm9pub-player";
          else if (cell === 1) nodeCls += " mm9pub-bot";
          if (i === state.selectedPos) nodeCls += " mm9pub-selected";
          else if (legalTargets.has(i) && cell === null) nodeCls += " mm9pub-legal";
          else if (state.mustRemove && state.turn === seat && canRemove(state.board, i, opp)) nodeCls += " mm9pub-removable";
          if (millPos.has(i)) nodeCls += " mm9pub-mill";
          return (
            <button
              key={i}
              className={nodeCls}
              style={{ left: `${px(px2)}px`, top: `${px(py)}px` }}
              onClick={() => clickPos(i)}
              aria-label={`pos ${i}`}
            />
          );
        })}
      </div>
      <div className="mm9pub-foot">Bot: {state.settings.botStrength}</div>
    </div>
  );
}
