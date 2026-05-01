import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { GameState, GameAction, SixMorrisSettings } from "./state.js";
import { isTerminal, ADJACENCY, MILLS, canRemove, POINTS } from "./state.js";
import "./Game.css";

// Layout for 16-point board:
const POS_COORDS: ReadonlyArray<[number, number]> = [
  [0, 0], [50, 0], [100, 0],
  [100, 50], [100, 100],
  [50, 100], [0, 100], [0, 50],
  [22, 22], [50, 22], [78, 22],
  [78, 50], [78, 78],
  [50, 78], [22, 78], [22, 50],
];

function px(p: number): number { return (p / 100) * 280 + 16; }

export function SixMensMorrisGame({
  state,
  dispatch,
  onGameOver,
}: GameProps<GameState, SixMorrisSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);

  const seat = 0 as const;
  const opp = 1 as const;
  const isMyTurn = state.turn === seat && state.winner === null;

  const legalTargets = new Set<number>();
  if (isMyTurn && !state.mustRemove && state.selectedPos !== null && state.phase[seat] !== "placing") {
    ADJACENCY[state.selectedPos]!.filter((i) => state.board[i] === null).forEach((t2) => legalTargets.add(t2));
  }

  function clickPos(pos: number) {
    if (!isMyTurn) return;
    if (state.mustRemove) {
      if (canRemove(state.board, pos, opp)) dispatch({ type: "remove", pos } as GameAction);
      return;
    }
    if (state.phase[seat] === "placing") {
      if (state.board[pos] === null) dispatch({ type: "place", pos } as GameAction);
      return;
    }
    if (state.selectedPos !== null && legalTargets.has(pos)) {
      dispatch({ type: "move", to: pos } as GameAction);
      return;
    }
    if (state.board[pos] === seat) dispatch({ type: "select", pos } as GameAction);
  }

  const lines: Array<[number, number]> = [];
  const seen = new Set<string>();
  for (let i = 0; i < POINTS; i++) {
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
  let cls = "mm6-status";
  if (state.winner === seat) { status = "You win!"; cls += " mm6-win"; }
  else if (state.winner === opp) { status = "Bot wins"; cls += " mm6-loss"; }
  else if (state.mustRemove && state.turn === seat) status = "Mill! Remove a bot piece (red).";
  else if (!isMyTurn) status = "Bot is thinking...";
  else if (state.phase[seat] === "placing") status = `Placing — ${state.piecesToPlace[seat]} left`;
  else if (state.selectedPos === null) status = "Select your piece to move";
  else status = "Click a highlighted target";

  return (
    <div className="mm6-root">
      <div className="mm6-banner">SIX MEN'S MORRIS</div>
      <div className={cls}>{status}</div>
      <div className="mm6-counts">
        <span>You: {state.piecesOnBoard[seat] + state.piecesToPlace[seat]}</span>
        <span>Bot: {state.piecesOnBoard[opp] + state.piecesToPlace[opp]}</span>
      </div>
      <div className="mm6-board">
        <svg viewBox="0 0 312 312">
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
        {POS_COORDS.map(([cx, cy], i) => {
          const cell = state.board[i];
          let nodeCls = "mm6-pos";
          if (cell === 0) nodeCls += " mm6-player";
          else if (cell === 1) nodeCls += " mm6-bot";
          if (i === state.selectedPos) nodeCls += " mm6-selected";
          else if (legalTargets.has(i) && cell === null) nodeCls += " mm6-legal";
          else if (state.mustRemove && state.turn === seat && canRemove(state.board, i, opp)) nodeCls += " mm6-removable";
          if (millPos.has(i)) nodeCls += " mm6-mill";
          return (
            <button
              key={i}
              className={nodeCls}
              style={{ left: `${px(cx)}px`, top: `${px(cy)}px` }}
              onClick={() => clickPos(i)}
              aria-label={`pos ${i}`}
            />
          );
        })}
      </div>
      <div className="mm6-foot">Bot: {state.settings.botStrength}</div>
    </div>
  );
}
