import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { MuTorereState } from "./state.js";
import { isTerminal, getLegalMoves, allMovesFor } from "./state.js";
import "./Game.css";

type MuTorereSettings = Record<string, never>;

const R = 120; // radius of outer ring
const CR = 22; // piece circle radius
const CX = 180, CY = 180; // center of SVG

function kewaiPos(i: number): { x: number; y: number } {
  const angle = (Math.PI * 2 * i) / 8 - Math.PI / 2;
  return { x: CX + R * Math.cos(angle), y: CY + R * Math.sin(angle) };
}

export function MuTorereGame({ state, dispatch, onGameOver }: GameProps<MuTorereState, MuTorereSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  const isHumanTurn = state.turn === 0 && state.winner === null;

  const targets = (state.selected !== null && isHumanTurn)
    ? getLegalMoves(state.spaces, state.selected, 0)
    : [];
  const targetSet = new Set(targets);

  const humanHasMoves = isHumanTurn && allMovesFor(state.spaces, 0).length > 0;

  let statusText = "";
  let statusClass = "";
  if (state.winner === 0) { statusText = "You win!"; statusClass = "win"; }
  else if (state.winner === 1) { statusText = "Bot wins!"; statusClass = "loss"; }
  else if (!isHumanTurn) statusText = "Bot thinking…";
  else if (!humanHasMoves) statusText = "No moves — you lose!";
  else if (state.selected === null) statusText = "Select one of your dark pieces.";
  else statusText = "Click highlighted space to move.";

  function handleClick(idx: number) {
    if (!isHumanTurn) return;
    if (state.spaces[idx] === 0) {
      dispatch({ type: "select", idx });
    } else if (state.selected !== null && targetSet.has(idx)) {
      dispatch({ type: "move", to: idx });
    }
  }

  const positions = [
    ...Array.from({ length: 8 }, (_, i) => kewaiPos(i)),
    { x: CX, y: CY }, // center = index 8
  ];

  // Draw lines from center to each kewai
  const spokes = Array.from({ length: 8 }, (_, i) => {
    const p = kewaiPos(i);
    return <line key={i} x1={CX} y1={CY} x2={p.x} y2={p.y} stroke="#8b6020" strokeWidth={2} />;
  });
  // Draw outer octagon
  const outerPath = Array.from({ length: 8 }, (_, i) => {
    const p = kewaiPos(i);
    return `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`;
  }).join(" ") + " Z";

  return (
    <div className="mutorere">
      <div className={`muto-status ${statusClass}`}>{statusText}</div>
      <svg className="muto-svg" width={360} height={360} viewBox="0 0 360 360">
        <path d={outerPath} fill="none" stroke="#8b6020" strokeWidth={2} />
        {spokes}
        {positions.map((pos, idx) => {
          const cell = state.spaces[idx];
          const isSel = state.selected === idx;
          const isTarget = targetSet.has(idx);
          return (
            <g key={idx} onClick={() => handleClick(idx)} style={{ cursor: isHumanTurn ? "pointer" : "default" }}>
              <circle cx={pos.x} cy={pos.y} r={CR + 4}
                fill={isSel ? "#ffe88a" : isTarget ? "#aaffaa" : "#d4c090"}
                stroke={isTarget ? "#22aa22" : "#8b6020"} strokeWidth={isTarget ? 2.5 : 1.5} />
              {cell === 0 && (
                <circle cx={pos.x} cy={pos.y} r={CR} fill={isSel ? "#3344cc" : "#222"} stroke="#555" strokeWidth={1.5} />
              )}
              {cell === 1 && (
                <circle cx={pos.x} cy={pos.y} r={CR} fill="#f0f0f0" stroke="#999" strokeWidth={1.5} />
              )}
              {idx === 8 && <text x={pos.x} y={pos.y + 5} textAnchor="middle" fontSize={10} fill="#888">putahi</text>}
            </g>
          );
        })}
      </svg>
      <div className="muto-legend">
        <span className="muto-dark">● You (dark, positions 0-3)</span>
        <span className="muto-light">● Bot (light, positions 4-7)</span>
      </div>
    </div>
  );
}
