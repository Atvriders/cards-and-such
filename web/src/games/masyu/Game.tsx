import { useEffect, useRef, useCallback } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { MasyuState, MasyuSettings } from "./state.js";
import { type MasyuAction, isTerminal, edgeKey, getNeighbors } from "./state.js";
import "./Game.css";

const CELL = 52;
const PAD = 26;

export function Masyu({
  state,
  dispatch,
  onGameOver,
}: GameProps<MasyuState, MasyuSettings>): JSX.Element {
  const terminal = isTerminal(state);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  const { puzzle, edges, won } = state;
  const { rows, cols, pearls } = puzzle;

  const width = PAD * 2 + cols * CELL;
  const height = PAD * 2 + rows * CELL;

  const cellCenter = useCallback(
    (idx: number): [number, number] => {
      const r = Math.floor(idx / cols);
      const c = idx % cols;
      return [PAD + c * CELL + CELL / 2, PAD + r * CELL + CELL / 2];
    },
    [cols],
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    ctx.clearRect(0, 0, width, height);

    // Draw grid
    ctx.strokeStyle = "#ddd";
    ctx.lineWidth = 1;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = PAD + c * CELL;
        const y = PAD + r * CELL;
        ctx.strokeRect(x, y, CELL, CELL);
      }
    }

    // Draw solution edges (hint, semi-transparent) — skip for now, only draw player edges
    // Draw player edges
    ctx.strokeStyle = "#2471a3";
    ctx.lineWidth = 4;
    ctx.lineJoin = "round";
    for (const e of edges) {
      const [a, b] = e.split("-").map(Number) as [number, number];
      const [ax, ay] = cellCenter(a);
      const [bx, by] = cellCenter(b);
      ctx.beginPath();
      ctx.moveTo(ax, ay);
      ctx.lineTo(bx, by);
      ctx.stroke();
    }

    // Draw pearls
    for (let i = 0; i < rows * cols; i++) {
      const pearl = pearls[i];
      if (pearl === "none") continue;
      const [x, y] = cellCenter(i);
      ctx.beginPath();
      ctx.arc(x, y, CELL / 4, 0, Math.PI * 2);
      if (pearl === "white") {
        ctx.fillStyle = "#fff";
        ctx.strokeStyle = "#333";
        ctx.lineWidth = 2.5;
        ctx.fill();
        ctx.stroke();
      } else {
        ctx.fillStyle = "#222";
        ctx.fill();
      }
    }

    if (won) {
      ctx.fillStyle = "rgba(39,174,96,0.18)";
      ctx.fillRect(0, 0, width, height);
    }
  }, [edges, pearls, rows, cols, won, width, height, cellCenter]);

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (won) return;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;

      // Detect which edge was clicked (click near the midpoint between two adjacent cells)
      let bestDist = 16;
      let bestEdge: [number, number] | null = null;

      for (let i = 0; i < rows * cols; i++) {
        const neighbors = getNeighbors(i, rows, cols);
        for (const j of neighbors) {
          if (j <= i) continue; // avoid duplicates
          const [ax, ay] = cellCenter(i);
          const [bx, by] = cellCenter(j);
          const mx2 = (ax + bx) / 2;
          const my2 = (ay + by) / 2;
          const dist = Math.hypot(mx - mx2, my - my2);
          if (dist < bestDist) {
            bestDist = dist;
            bestEdge = [i, j];
          }
        }
      }

      if (bestEdge) {
        dispatch({ type: "toggleEdge", from: bestEdge[0], to: bestEdge[1] } satisfies MasyuAction);
      }
    },
    [won, rows, cols, cellCenter, dispatch],
  );

  return (
    <div className="masyupearl">
      <div className="masyupearl-title">Masyu</div>
      <div className={`masyupearl-status${won ? " win" : ""}`}>
        {won
          ? `Solved! Score: ${terminal?.score ?? 0}`
          : `Moves: ${state.moves} — draw a loop through all pearls`}
      </div>

      <div className="masyupearl-canvas-wrap">
        <canvas
          ref={canvasRef}
          className="masyupearl-canvas"
          width={width}
          height={height}
          onClick={handleClick}
        />
      </div>

      <div className="masyupearl-legend">
        Click between adjacent cells to draw/erase a loop segment. ● = black pearl (turn here). ○ = white pearl (go straight).
      </div>

      <div className="masyupearl-btn-row">
        <button onClick={() => dispatch({ type: "reset" })}>Reset</button>
      </div>
    </div>
  );
}
