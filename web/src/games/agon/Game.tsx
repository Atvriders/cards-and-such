import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { AgonState, AgonSettings, AgonAction, Cell } from "./state.js";
import { isTerminal, cellKey, hexNeighbors, legalMoves } from "./state.js";
import "./Game.css";

export function Agon({
  state,
  dispatch,
  onGameOver,
}: GameProps<AgonState, AgonSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  // Layout: axial hex grid to pixel (flat-top)
  const HEX_SIZE = 28;
  const W = HEX_SIZE * Math.sqrt(3);
  const H = HEX_SIZE * 2;
  const SVG_W = 500;
  const SVG_H = 480;
  const OX = SVG_W / 2;
  const OY = SVG_H / 2;

  function hexToPixel(q: number, r: number): { x: number; y: number } {
    const x = OX + HEX_SIZE * (Math.sqrt(3) * q + (Math.sqrt(3) / 2) * r);
    const y = OY + HEX_SIZE * (1.5 * r);
    return { x, y };
  }

  function hexCorners(cx: number, cy: number): string {
    const pts: string[] = [];
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 180) * (60 * i - 30);
      pts.push(`${cx + HEX_SIZE * Math.cos(angle)},${cy + HEX_SIZE * Math.sin(angle)}`);
    }
    return pts.join(" ");
  }

  // Collect all board cells
  const cells: Cell[] = [];
  for (let q = -5; q <= 5; q++) {
    for (let r = -5; r <= 5; r++) {
      const s = -q - r;
      if (Math.abs(s) <= 5) cells.push({ q, r });
    }
  }

  const selected = state.selected;
  let validTargets = new Set<string>();
  if (selected && state.turn === "white" && state.winner === null) {
    const moves = legalMoves(state.board, "white");
    for (const m of moves) {
      if (m.from.q === selected.q && m.from.r === selected.r) {
        validTargets.add(cellKey(m.to));
      }
    }
  }

  function handleHexClick(cell: Cell) {
    if (state.winner !== null || state.turn !== "white") return;
    const key = cellKey(cell);
    if (validTargets.has(key)) {
      dispatch({ type: "move", to: cell } satisfies AgonAction);
    } else {
      const piece = state.board.get(key);
      if (piece && piece.color === "white") {
        dispatch({ type: "select", cell } satisfies AgonAction);
      }
    }
  }

  let statusText = "";
  let statusClass = "";
  if (state.winner === "white") { statusText = "You win! Queen centred!"; statusClass = "win"; }
  else if (state.winner === "black") { statusText = "Bot wins!"; statusClass = "loss"; }
  else if (state.turn === "black") { statusText = "Bot thinking..."; }
  else if (selected) { statusText = "Click a highlighted hex to move."; }
  else { statusText = "Select a white piece to move."; }

  // Ring colours
  function ringColor(q: number, r: number): string {
    const dist = Math.max(Math.abs(q), Math.abs(r), Math.abs(-q - r));
    if (dist === 0) return "#ffd700";
    if (dist <= 2) return "#c8a96a";
    if (dist <= 4) return "#b8935a";
    return "#a87f4a";
  }

  return (
    <div className="agon-game fade-in">
      <div className={`agon-status ${statusClass}`}>{statusText}</div>
      <svg
        width={SVG_W}
        height={SVG_H}
        className="agon-svg"
        onClick={(e) => {
          // handled per hex
          void e;
        }}
      >
        {cells.map((cell) => {
          const { x, y } = hexToPixel(cell.q, cell.r);
          const key = cellKey(cell);
          const piece = state.board.get(key);
          const isSelected = selected && selected.q === cell.q && selected.r === cell.r;
          const isTarget = validTargets.has(key);
          const isCentre = cell.q === 0 && cell.r === 0;
          const fill = isTarget
            ? "#7fdbff"
            : isSelected
            ? "#ffe066"
            : isCentre
            ? "#ffd700"
            : ringColor(cell.q, cell.r);

          return (
            <g key={key} onClick={() => handleHexClick(cell)} style={{ cursor: "pointer" }}>
              <polygon
                points={hexCorners(x, y)}
                fill={fill}
                stroke="#555"
                strokeWidth={0.8}
              />
              {piece && (
                <circle
                  cx={x}
                  cy={y}
                  r={piece.type === "queen" ? 13 : 9}
                  fill={piece.color === "white" ? "#f0f0f0" : "#222"}
                  stroke={piece.color === "white" ? "#888" : "#ccc"}
                  strokeWidth={1.5}
                />
              )}
              {piece && piece.type === "queen" && (
                <text
                  x={x}
                  y={y + 5}
                  textAnchor="middle"
                  fontSize={12}
                  fill={piece.color === "white" ? "#333" : "#eee"}
                  style={{ pointerEvents: "none", userSelect: "none" }}
                >
                  Q
                </text>
              )}
            </g>
          );
        })}
      </svg>
      <div className="agon-legend">
        <span className="agon-legend-white">&#9679; You (White)</span>
        <span className="agon-legend-black">&#9679; Bot (Black)</span>
        <span>Goal: Queen to centre, all 6 Guards surrounding it</span>
      </div>
    </div>
  );
}
