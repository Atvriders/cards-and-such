import { useEffect, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { CastleWallState, CastleWallSettings, CastleWallAction, Edge } from "./state.js";
import { isTerminal, edgeKey } from "./state.js";
import "./CastleWall.css";

const CELL = 52;
const DOT = 4;

export function CastleWall({ state, dispatch, onGameOver }: GameProps<CastleWallState, CastleWallSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  const { puzzle, edges, won } = state;
  const { size, clues } = puzzle;
  const dots = size + 1;
  const W = dots * CELL;

  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, W, W);

    // Draw clue cells
    for (const clue of clues) {
      const x = clue.c * CELL;
      const y = clue.r * CELL;
      ctx.fillStyle = clue.color === "black" ? "#333" : "#ddd";
      ctx.fillRect(x, y, CELL, CELL);
      if (clue.count >= 0) {
        ctx.fillStyle = clue.color === "black" ? "#fff" : "#333";
        ctx.font = "bold 18px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(String(clue.count), x + CELL / 2, y + CELL / 2);
      }
    }

    // Draw grid dots
    for (let r = 0; r <= size; r++) {
      for (let c = 0; c <= size; c++) {
        ctx.beginPath();
        ctx.arc(c * CELL, r * CELL, DOT, 0, Math.PI * 2);
        ctx.fillStyle = "#555";
        ctx.fill();
      }
    }

    // Draw edges
    for (const key of edges) {
      const [r1s, c1s, r2s, c2s] = key.split(",").map(Number) as [number, number, number, number];
      ctx.beginPath();
      ctx.moveTo(c1s * CELL, r1s * CELL);
      ctx.lineTo(c2s * CELL, r2s * CELL);
      ctx.strokeStyle = won ? "#27ae60" : "#1565c0";
      ctx.lineWidth = 3;
      ctx.stroke();
    }
  }, [edges, won, clues, size, W]);

  function handleClick(e: React.MouseEvent<HTMLCanvasElement>): void {
    if (won) return;
    const rect = canvasRef.current!.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    // Find nearest edge (midpoint of an adjacent dot pair)
    let best: Edge | null = null;
    let bestDist = Infinity;

    for (let r = 0; r <= size; r++) {
      for (let c = 0; c <= size; c++) {
        // Horizontal edge to the right
        if (c < size) {
          const mx2 = (c + 0.5) * CELL;
          const my2 = r * CELL;
          const d = Math.hypot(mx - mx2, my - my2);
          if (d < bestDist) { bestDist = d; best = [r, c, r, c + 1]; }
        }
        // Vertical edge downward
        if (r < size) {
          const mx2 = c * CELL;
          const my2 = (r + 0.5) * CELL;
          const d = Math.hypot(mx - mx2, my - my2);
          if (d < bestDist) { bestDist = d; best = [r, c, r + 1, c]; }
        }
      }
    }

    if (best && bestDist < CELL * 0.6) {
      dispatch({ type: "toggleEdge", edge: best } satisfies CastleWallAction);
    }
  }

  return (
    <div className="castle-wall">
      <div className="castle-wall-title">Castle Wall</div>
      <div className={`castle-wall-status${won ? " win" : ""}`}>
        {won
          ? `Solved! Score: ${terminal?.score ?? 0}`
          : `Moves: ${state.moves} — click between dots to draw loop edges`}
      </div>

      <div className="castle-wall-canvas-wrapper">
        <canvas
          ref={canvasRef}
          width={W}
          height={W}
          onClick={handleClick}
          style={{ display: "block" }}
        />
      </div>

      <div className="castle-wall-btns">
        <button data-testid="hint-target-castle-wall-action" onClick={() => dispatch({ type: "reset" } satisfies CastleWallAction)}>Reset</button>
      </div>
    </div>
  );
}
