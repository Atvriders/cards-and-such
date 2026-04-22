import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { AbaloneState, AbaloneSettings } from "./state.js";
import { type AbaloneAction, isTerminal, HEX_DIRS, onBoard, hexKey } from "./state.js";
import "./Game.css";

const DIRS_LABELS = ["→", "←", "↘", "↖", "↗", "↙"];

// Convert axial to pixel (pointy-top hex)
function hexToPixel(q: number, r: number, size: number): { x: number; y: number } {
  const x = size * (Math.sqrt(3) * q + Math.sqrt(3) / 2 * r);
  const y = size * (3 / 2 * r);
  return { x, y };
}

const HEX_RADIUS = 26;

export function Abalone({
  state,
  dispatch,
  onGameOver,
}: GameProps<AbaloneState, AbaloneSettings>): JSX.Element {
  const terminal = isTerminal(state);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  const isHumanTurn = state.turn === 0 && state.winner === null;
  const selectedSet = new Set(state.selected.map((s) => hexKey(s.q, s.r)));

  // Build list of cells to render
  const cells: Array<{ q: number; r: number; cell: 0 | 1 | null; px: number; py: number }> = [];
  for (const [key, cell] of state.board.entries()) {
    const [qs, rs] = key.split(",").map(Number);
    const { x, y } = hexToPixel(qs!, rs!, HEX_RADIUS);
    cells.push({ q: qs!, r: rs!, cell, px: x, py: y });
  }

  const minX = Math.min(...cells.map((c) => c.px));
  const minY = Math.min(...cells.map((c) => c.py));
  const maxX = Math.max(...cells.map((c) => c.px));
  const maxY = Math.max(...cells.map((c) => c.py));
  const padX = 40;
  const padY = 40;
  const svgW = maxX - minX + 2 * padX + HEX_RADIUS * 2;
  const svgH = maxY - minY + 2 * padY + HEX_RADIUS * 2;

  function handleCellClick(q: number, r: number) {
    if (!isHumanTurn) return;
    dispatch({ type: "select", coord: { q, r } } satisfies AbaloneAction);
  }

  function handleMove(dir: number) {
    dispatch({ type: "move", dir } satisfies AbaloneAction);
  }

  let statusText = "";
  let statusClass = "";
  if (state.winner === 0) { statusText = "You win!"; statusClass = "win"; }
  else if (state.winner === 1) { statusText = "Bot wins!"; statusClass = "loss"; }
  else if (!isHumanTurn) statusText = "Bot thinking...";
  else if (state.selected.length === 0) statusText = "Select 1–3 of your Black marbles.";
  else statusText = `${state.selected.length} marble(s) selected — click direction to move or add/remove marbles.`;

  const hexPoints = (cx: number, cy: number, r: number): string =>
    Array.from({ length: 6 }, (_, i) => {
      const angle = (Math.PI / 3) * i;
      return `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`;
    }).join(" ");

  return (
    <div className="abalone">
      <div className={`abalone-status ${statusClass}`}>{statusText}</div>
      <div className="abalone-score">
        <span>Your marbles lost: {state.pushed[0]}/6</span>
        <span>Bot marbles lost: {state.pushed[1]}/6</span>
      </div>
      <div className="abalone-board-wrap">
        <svg
          className="abalone-svg"
          width={svgW}
          height={svgH}
          viewBox={`${minX - padX} ${minY - padY} ${svgW} ${svgH}`}
        >
          {cells.map(({ q, r, cell, px, py }) => {
            const key = hexKey(q, r);
            const isSel = selectedSet.has(key);
            const fill = cell === 0 ? (isSel ? "#4444ff" : "#222222")
              : cell === 1 ? "#eeeeee"
              : "#c8a030";
            const stroke = isSel ? "#88aaff" : "#8b6020";
            return (
              <g key={key} onClick={() => handleCellClick(q, r)} style={{ cursor: isHumanTurn && cell === 0 ? "pointer" : "default" }}>
                <polygon
                  points={hexPoints(px, py, HEX_RADIUS - 2)}
                  fill={fill}
                  stroke={stroke}
                  strokeWidth={isSel ? 2.5 : 1.5}
                  data-testid={`abal-${q}-${r}`}
                />
                {cell !== null && (
                  <circle
                    cx={px}
                    cy={py}
                    r={HEX_RADIUS * 0.55}
                    fill={cell === 0 ? (isSel ? "#6666ff" : "#333") : "#f0f0f0"}
                    stroke={cell === 0 ? "#111" : "#aaa"}
                    strokeWidth={1}
                  />
                )}
              </g>
            );
          })}
        </svg>
      </div>
      {isHumanTurn && state.selected.length > 0 && (
        <div className="abalone-dirs">
          <div className="abalone-dirs-label">Move direction:</div>
          <div className="abalone-dirs-grid">
            {HEX_DIRS.map((_, i) => (
              <button key={i} className="abalone-dir-btn" onClick={() => handleMove(i)}>
                {DIRS_LABELS[i]}
              </button>
            ))}
          </div>
        </div>
      )}
      <div className="abalone-legend">
        <span className="abal-leg black-leg">● You (Black)</span>
        <span className="abal-leg white-leg">● Bot (White)</span>
      </div>
    </div>
  );
}
