import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { SurakartaState } from "./state.js";
import { isTerminal, legalMoves, rc, row, col } from "./state.js";
import "./Game.css";

type SurakartaSettings = Record<string, never>;

const CELL = 64;
const PAD = 32;

export function SurakartaGame({ state, dispatch, onGameOver }: GameProps<SurakartaState, SurakartaSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  const isHumanTurn = state.turn === 0 && state.winner === null;
  const targets = state.selected !== null && isHumanTurn
    ? legalMoves(state.board, state.selected, 0)
    : [];
  const targetSet = new Set(targets);

  const W = PAD * 2 + CELL * 5;
  const H = PAD * 2 + CELL * 5;

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
  else if (state.selected === null) statusText = "Select one of your pieces (dark).";
  else statusText = "Click a highlighted square to move, or a loop target to capture.";

  // Draw loop arcs (visual only)
  // Inner arc corners
  const innerR = CELL * 1.5;
  const outerR = CELL * 2.5;

  return (
    <div className="surakarta">
      <div className={`sura-status ${statusClass}`}>{statusText}</div>
      <svg className="sura-svg" width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        {/* Grid lines */}
        {[0,1,2,3,4,5].map((r) => (
          <line key={`hr${r}`} x1={cx(0)} y1={cy(r)} x2={cx(5)} y2={cy(r)} stroke="#8b6020" strokeWidth={1.5} />
        ))}
        {[0,1,2,3,4,5].map((c) => (
          <line key={`vc${c}`} x1={cx(c)} y1={cy(0)} x2={cx(c)} y2={cy(5)} stroke="#8b6020" strokeWidth={1.5} />
        ))}
        {/* Corner loop arcs (decorative) */}
        {/* Inner loop arcs */}
        <path d={`M ${cx(1)} ${cy(0)} A ${innerR} ${innerR} 0 0 0 ${cx(0)} ${cy(1)}`} fill="none" stroke="#c06030" strokeWidth={2.5} />
        <path d={`M ${cx(4)} ${cy(0)} A ${innerR} ${innerR} 0 0 1 ${cx(5)} ${cy(1)}`} fill="none" stroke="#c06030" strokeWidth={2.5} />
        <path d={`M ${cx(0)} ${cy(4)} A ${innerR} ${innerR} 0 0 0 ${cx(1)} ${cy(5)}`} fill="none" stroke="#c06030" strokeWidth={2.5} />
        <path d={`M ${cx(5)} ${cy(4)} A ${innerR} ${innerR} 0 0 1 ${cx(4)} ${cy(5)}`} fill="none" stroke="#c06030" strokeWidth={2.5} />
        {/* Outer loop arcs */}
        <path d={`M ${cx(2)} ${cy(0)-10} A ${outerR} ${outerR} 0 0 0 ${cx(0)-10} ${cy(2)}`} fill="none" stroke="#a04010" strokeWidth={2} />
        <path d={`M ${cx(3)} ${cy(0)-10} A ${outerR} ${outerR} 0 0 1 ${cx(5)+10} ${cy(2)}`} fill="none" stroke="#a04010" strokeWidth={2} />
        <path d={`M ${cx(0)-10} ${cy(3)} A ${outerR} ${outerR} 0 0 0 ${cx(2)} ${cy(5)+10}`} fill="none" stroke="#a04010" strokeWidth={2} />
        <path d={`M ${cx(5)+10} ${cy(3)} A ${outerR} ${outerR} 0 0 1 ${cx(3)} ${cy(5)+10}`} fill="none" stroke="#a04010" strokeWidth={2} />

        {/* Cells */}
        {state.board.map((cell, idx) => {
          const r = row(idx), c = col(idx);
          const x = cx(c), y = cy(r);
          const isSel = state.selected === idx;
          const isTarget = targetSet.has(idx);
          return (
            <g key={idx} onClick={() => handleCell(idx)} style={{ cursor: isHumanTurn ? "pointer" : "default" }}>
              <rect
                x={x - CELL / 2 + 2} y={y - CELL / 2 + 2}
                width={CELL - 4} height={CELL - 4}
                fill={isSel ? "#ffe88a" : isTarget ? "#c8ffc8" : (r + c) % 2 === 0 ? "#f5e8c8" : "#e0c890"}
                stroke="none" rx={3}
              />
              {cell === 0 && (
                <circle cx={x} cy={y} r={22} fill={isSel ? "#3344cc" : "#222"} stroke="#555" strokeWidth={1.5} />
              )}
              {cell === 1 && (
                <circle cx={x} cy={y} r={22} fill="#eee" stroke="#888" strokeWidth={1.5} />
              )}
              {isTarget && cell === null && (
                <circle cx={x} cy={y} r={8} fill="#44aa44" opacity={0.7}
                  onClick={(e) => { e.stopPropagation(); handleTarget(idx); }} style={{ cursor: "pointer" }} />
              )}
              {isTarget && cell === 1 && (
                <circle cx={x} cy={y} r={26} fill="none" stroke="#ff4444" strokeWidth={3}
                  onClick={(e) => { e.stopPropagation(); handleTarget(idx); }} />
              )}
            </g>
          );
        })}
      </svg>
      <div className="sura-legend">
        <span className="sura-black">● You (dark)</span>
        <span className="sura-white">● Bot (light)</span>
      </div>
    </div>
  );
}
