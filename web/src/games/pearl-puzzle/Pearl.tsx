import { useEffect, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { PearlState, PearlSettings, PearlAction, Edge } from "./state.js";
import { isTerminal, edgeKey } from "./state.js";
import "./Pearl.css";

const CELL = 52;
const DOT = 4;
const PEARL_R = 10;

export function Pearl({ state, dispatch, onGameOver }: GameProps<PearlState, PearlSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  const { puzzle, edges, won } = state;
  const { size, pearls } = puzzle;
  const dots = size + 1;
  const W = dots * CELL;

  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, W, W);

    // Draw grid background
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        ctx.strokeStyle = "#ccc";
        ctx.lineWidth = 0.5;
        ctx.strokeRect(c * CELL, r * CELL, CELL, CELL);
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

    // Draw pearls at cell centers
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        const pearl = pearls[r * size + c];
        if (!pearl) continue;
        const cx = c * CELL + CELL / 2;
        const cy = r * CELL + CELL / 2;
        ctx.beginPath();
        ctx.arc(cx, cy, PEARL_R, 0, Math.PI * 2);
        if (pearl === "black") {
          ctx.fillStyle = "#333";
          ctx.fill();
        } else {
          ctx.fillStyle = "#fff";
          ctx.fill();
          ctx.strokeStyle = "#333";
          ctx.lineWidth = 2.5;
          ctx.stroke();
        }
      }
    }

    // Draw dots at intersections
    for (let r = 0; r <= size; r++) {
      for (let c = 0; c <= size; c++) {
        ctx.beginPath();
        ctx.arc(c * CELL, r * CELL, DOT, 0, Math.PI * 2);
        ctx.fillStyle = "#555";
        ctx.fill();
      }
    }
  }, [edges, won, pearls, size, W]);

  function handleClick(e: React.MouseEvent<HTMLCanvasElement>): void {
    if (won) return;
    const rect = canvasRef.current!.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    let best: Edge | null = null;
    let bestDist = Infinity;

    for (let r = 0; r <= size; r++) {
      for (let c = 0; c <= size; c++) {
        if (c < size) {
          const d = Math.hypot(mx - (c + 0.5) * CELL, my - r * CELL);
          if (d < bestDist) { bestDist = d; best = [r, c, r, c + 1]; }
        }
        if (r < size) {
          const d = Math.hypot(mx - c * CELL, my - (r + 0.5) * CELL);
          if (d < bestDist) { bestDist = d; best = [r, c, r + 1, c]; }
        }
      }
    }

    if (best && bestDist < CELL * 0.6) {
      dispatch({ type: "toggleEdge", edge: best } satisfies PearlAction);
    }
  }

  return (
    <div className="pearl">
      <div className="pearl-title">Pearl</div>
      <div className={`pearl-status${won ? " win" : ""}`}>
        {won
          ? `Solved! Score: ${terminal?.score ?? 0}`
          : `Moves: ${state.moves} — click between dots to draw loop edges`}
      </div>

      <div className="pearl-canvas-wrapper">
        <canvas
          ref={canvasRef}
          width={W}
          height={W}
          onClick={handleClick}
          style={{ display: "block" }}
        />
      </div>

      <div className="pearl-legend">Black pearl = turn here, straight neighbours | White pearl = straight here, turn nearby</div>

      <div className="pearl-btns">
        <button onClick={() => dispatch({ type: "reset" } satisfies PearlAction)}>Reset</button>
      </div>
    </div>
  );
}
