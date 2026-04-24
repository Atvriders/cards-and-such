import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { LoaSmallState } from "./state.js";
import { isTerminal, getLegalMovesFrom, rc, rowOf, colOf } from "./state.js";
import "./Game.css";

type LoaSmallSettings = Record<string, never>;

const CELL = 64;
const PAD = 24;

export function LoaSmallGame({ state, dispatch, onGameOver }: GameProps<LoaSmallState, LoaSmallSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  const isHumanTurn = state.turn === 0 && state.winner === null;
  const targets = state.selected !== null && isHumanTurn
    ? getLegalMovesFrom(state.board, state.selected, 0)
    : [];
  const targetSet = new Set(targets);

  const W = PAD * 2 + CELL * 6;
  const H = PAD * 2 + CELL * 6;

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

  function handleTarget(to: number) {
    dispatch({ type: "move", to });
  }

  let statusText = "";
  let statusClass = "";
  if (state.winner === 0) { statusText = "You win!"; statusClass = "win"; }
  else if (state.winner === 1) { statusText = "Bot wins!"; statusClass = "loss"; }
  else if (!isHumanTurn) statusText = "Bot thinking…";
  else if (state.selected === null) statusText = "Select one of your dark pieces.";
  else statusText = "Click a highlighted square to move (or capture).";

  return (
    <div className="loa-small">
      <div className={`loa-status ${statusClass}`}>{statusText}</div>
      <svg className="loa-svg" width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        {/* Board */}
        {Array.from({ length: 6 }, (_, r) =>
          Array.from({ length: 6 }, (_, c) => {
            const idx = rc(r, c);
            const isSel = state.selected === idx;
            const isTarget = targetSet.has(idx);
            const cell = state.board[idx];
            const isDark = (r + c) % 2 === 1;
            const x = cx(c), y = cy(r);
            return (
              <g key={idx} onClick={() => handleCell(idx)} style={{ cursor: isHumanTurn ? "pointer" : "default" }}>
                <rect x={x - CELL / 2} y={y - CELL / 2} width={CELL} height={CELL}
                  fill={isSel ? "#ffe88a" : isTarget ? (cell === 1 ? "#ffbbbb" : "#bbffbb") : isDark ? "#c8a050" : "#f0dca0"}
                  stroke="#888" strokeWidth={0.5} />
                {cell === 0 && <circle cx={x} cy={y} r={24} fill={isSel ? "#3344cc" : "#222"} stroke="#555" strokeWidth={1.5} />}
                {cell === 1 && <circle cx={x} cy={y} r={24} fill="#f0f0f0" stroke="#aaa" strokeWidth={1.5} />}
                {isTarget && cell === null && (
                  <circle cx={x} cy={y} r={8} fill="#44aa44" opacity={0.8}
                    onClick={(e) => { e.stopPropagation(); handleTarget(idx); }} style={{ cursor: "pointer" }} />
                )}
                {isTarget && cell === 1 && (
                  <circle cx={x} cy={y} r={28} fill="none" stroke="#dd2222" strokeWidth={3}
                    onClick={(e) => { e.stopPropagation(); handleTarget(idx); }} />
                )}
              </g>
            );
          })
        )}
        {/* Row/col labels */}
        {Array.from({ length: 6 }, (_, i) => (
          <>
            <text key={`r${i}`} x={PAD - 8} y={cy(i) + 5} textAnchor="end" fontSize={11} fill="#666">{6 - i}</text>
            <text key={`c${i}`} x={cx(i)} y={PAD - 6} textAnchor="middle" fontSize={11} fill="#666">{String.fromCharCode(65 + i)}</text>
          </>
        ))}
      </svg>
      <div className="loa-legend">
        <span className="loa-dark">● You (dark, cols A & F)</span>
        <span className="loa-light">● Bot (light, rows 1 & 6)</span>
      </div>
    </div>
  );
}
