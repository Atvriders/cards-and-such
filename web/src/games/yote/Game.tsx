import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { YoteState } from "./state.js";
import { isTerminal, getMovesFor, getCapturesFor, rc, rowOf, colOf } from "./state.js";
import "./Game.css";

type YoteSettings = Record<string, never>;

const CELL = 64;
const PAD = 20;

export function YoteGame({ state, dispatch, onGameOver }: GameProps<YoteState, YoteSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  const isHumanTurn = state.turn === 0 && state.winner === null;
  const allMoves = isHumanTurn ? getMovesFor(state.board, state.inHand[0], 0) : [];
  const captures = allMoves.filter((m) => m.captured !== undefined);
  const mustCapture = captures.length > 0;
  const validMoves = mustCapture ? captures : allMoves;

  const movesFrom = state.selected !== null
    ? validMoves.filter((m) => m.from === state.selected)
    : [];
  const targetSet = new Set(movesFrom.map((m) => m.to));

  const W = PAD * 2 + CELL * 6;
  const H = PAD * 2 + CELL * 5;

  function cx(c: number) { return PAD + c * CELL + CELL / 2; }
  function cy(r: number) { return PAD + r * CELL + CELL / 2; }

  function handleCell(idx: number) {
    if (!isHumanTurn) return;
    const cell = state.board[idx];

    // Placement phase
    if (state.inHand[0] > 0 && cell === null && !mustCapture) {
      dispatch({ type: "place", to: idx });
      return;
    }

    // Select own piece for moving
    if (cell === 0) {
      dispatch({ type: "select", idx });
      return;
    }

    // Move to target
    if (state.selected !== null && targetSet.has(idx)) {
      dispatch({ type: "move", to: idx });
    }
  }

  let statusText = "";
  let statusClass = "";
  if (state.winner === 0) { statusText = "You win!"; statusClass = "win"; }
  else if (state.winner === 1) { statusText = "Bot wins!"; statusClass = "loss"; }
  else if (!isHumanTurn) statusText = "Bot thinking…";
  else if (state.inHand[0] > 0 && !mustCapture) statusText = `Click empty square to place (${state.inHand[0]} left).`;
  else if (mustCapture) statusText = "Capture is mandatory — select your piece.";
  else if (state.selected === null) statusText = "Select a piece to move.";
  else statusText = "Click highlighted square to move.";

  return (
    <div className="yote">
      <div className={`yote-status ${statusClass}`}>{statusText}</div>
      <div className="yote-hand">
        <span>Your reserve: {state.inHand[0]}</span>
        <span>Bot reserve: {state.inHand[1]}</span>
      </div>
      <svg className="yote-svg" width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        {/* Grid */}
        {Array.from({ length: 5 }, (_, r) => (
          <rect key={r} x={PAD} y={PAD + r * CELL} width={CELL * 6} height={CELL}
            fill={(r % 2 === 0) ? "#e8d8a8" : "#d4c07a"} stroke="#8b6020" strokeWidth={1} />
        ))}
        {Array.from({ length: 6 }, (_, c) => (
          <line key={c} x1={cx(c)} y1={PAD} x2={cx(c)} y2={PAD + CELL * 5} stroke="#8b6020" strokeWidth={1} />
        ))}
        {state.board.map((cell, idx) => {
          const r = rowOf(idx), c = colOf(idx);
          const x = cx(c), y = cy(r);
          const isSel = state.selected === idx;
          const isTarget = targetSet.has(idx);
          return (
            <g key={idx} data-testid={`yote-pos-${idx}`} onClick={() => handleCell(idx)} style={{ cursor: isHumanTurn ? "pointer" : "default" }}>
              {isSel && <rect x={x - CELL/2 + 2} y={y - CELL/2 + 2} width={CELL - 4} height={CELL - 4} fill="#ffe88a" stroke="none" />}
              {isTarget && cell === null && <circle cx={x} cy={y} r={10} fill="#44cc44" opacity={0.8} />}
              {cell === 0 && <circle cx={x} cy={y} r={24} fill={isSel ? "#2244cc" : "#222"} stroke="#555" strokeWidth={1.5} />}
              {cell === 1 && <circle cx={x} cy={y} r={24} fill="#f0f0f0" stroke="#999" strokeWidth={1.5} />}
              {isTarget && cell === 1 && <circle cx={x} cy={y} r={28} fill="none" stroke="#dd2222" strokeWidth={3} />}
            </g>
          );
        })}
      </svg>
      <div className="yote-legend">
        <span className="yote-dark">● You (dark)</span>
        <span className="yote-light">● Bot (light)</span>
        {mustCapture && <span className="yote-warn">⚠ Capture mandatory</span>}
      </div>
    </div>
  );
}
