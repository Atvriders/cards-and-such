import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { SlitherState } from "./state.js";
import { isTerminal, getLegalMoves, largestChain, rc, rowOf, colOf } from "./state.js";
import "./Game.css";

type SlitherSettings = Record<string, never>;

const CELL = 56;
const PAD = 20;

export function SlitherGame({ state, dispatch, onGameOver }: GameProps<SlitherState, SlitherSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  const isHumanTurn = state.turn === 0 && state.winner === null;
  const targets = state.selected !== null && isHumanTurn
    ? getLegalMoves(state.board, state.selected, 0)
    : [];
  const targetSet = new Set(targets);

  const hChain = largestChain(state.board, 0);
  const bChain = largestChain(state.board, 1);

  const W = PAD * 2 + CELL * 8;
  const H = PAD * 2 + CELL * 8;

  function cx(c: number) { return PAD + c * CELL + CELL / 2; }
  function cy(r: number) { return PAD + r * CELL + CELL / 2; }

  function handleCell(idx: number) {
    if (!isHumanTurn) return;
    if (state.board[idx] === 0) {
      dispatch({ type: "select", idx });
    } else if (state.selected !== null && targetSet.has(idx)) {
      dispatch({ type: "move", to: idx });
    } else {
      dispatch({ type: "select", idx });
    }
  }

  let statusText = "";
  let statusClass = "";
  if (state.winner === 0) { statusText = "You win! Chain of 6 formed!"; statusClass = "win"; }
  else if (state.winner === 1) { statusText = "Bot wins!"; statusClass = "loss"; }
  else if (!isHumanTurn) statusText = "Bot thinking…";
  else if (state.selected === null) statusText = "Select one of your dark pieces to move.";
  else statusText = "Click a green square to slide your piece there.";

  return (
    <div className="slither">
      <div className={`sli-status ${statusClass}`}>{statusText}</div>
      <div className="sli-chains">
        <span>Your chain: {hChain}/6</span>
        <span>Bot chain: {bChain}/6</span>
      </div>
      <svg className="sli-svg" width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        {state.board.map((cell, idx) => {
          const r = rowOf(idx), c = colOf(idx);
          const x = cx(c), y = cy(r);
          const isSel = state.selected === idx;
          const isTarget = targetSet.has(idx);
          const isDark = (r + c) % 2 === 1;
          return (
            <g key={idx} onClick={() => handleCell(idx)} style={{ cursor: isHumanTurn ? "pointer" : "default" }}>
              <rect x={x - CELL / 2} y={y - CELL / 2} width={CELL} height={CELL}
                fill={isSel ? "#ffe88a" : isTarget ? "#aaffaa" : isDark ? "#c8a050" : "#f0dca0"}
                stroke="#888" strokeWidth={0.5} />
              {cell === 0 && <circle cx={x} cy={y} r={20} fill={isSel ? "#3344cc" : "#222"} stroke="#555" strokeWidth={1.5} />}
              {cell === 1 && <circle cx={x} cy={y} r={20} fill="#f0f0f0" stroke="#999" strokeWidth={1.5} />}
              {isTarget && <circle cx={x} cy={y} r={7} fill="#44cc44" opacity={0.8}
                onClick={(e) => { e.stopPropagation(); dispatch({ type: "move", to: idx }); }} style={{ cursor: "pointer" }} />}
            </g>
          );
        })}
        {/* Coord labels */}
        {Array.from({ length: 8 }, (_, i) => (
          <text key={`l${i}`} x={PAD - 6} y={cy(i) + 4} textAnchor="end" fontSize={10} fill="#666">{8 - i}</text>
        ))}
      </svg>
      <div className="sli-legend">
        <span className="sli-dark">● You (dark) — goal: connect 6</span>
        <span className="sli-light">● Bot (light) — goal: connect 6</span>
      </div>
    </div>
  );
}
