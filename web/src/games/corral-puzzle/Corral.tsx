import { useEffect, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { CorralState, CorralSettings, CorralAction, Edge } from "./state.js";
import { isTerminal, edgeKey } from "./state.js";
import "./Corral.css";

const CELL = 52;
const DOT = 4;

export function Corral({ state, dispatch, onGameOver }: GameProps<CorralState, CorralSettings>): JSX.Element {
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

    // Draw cell backgrounds
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        ctx.fillStyle = "#f8f8f8";
        ctx.fillRect(c * CELL + 1, r * CELL + 1, CELL - 1, CELL - 1);
      }
    }

    // Draw clue numbers
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        const clue = clues[r * size + c];
        if (clue !== null) {
          ctx.fillStyle = "#1565c0";
          ctx.font = "bold 18px sans-serif";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(String(clue), c * CELL + CELL / 2, r * CELL + CELL / 2);
        }
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

    // Draw grid dots
    for (let r = 0; r <= size; r++) {
      for (let c = 0; c <= size; c++) {
        ctx.beginPath();
        ctx.arc(c * CELL, r * CELL, DOT, 0, Math.PI * 2);
        ctx.fillStyle = "#555";
        ctx.fill();
      }
    }
  }, [edges, won, clues, size, W]);

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
      dispatch({ type: "toggleEdge", edge: best } satisfies CorralAction);
    }
  }

  return (
    <div className="corral">
      <div className="corral-title">Corral</div>
      <div className={`corral-status${won ? " win" : ""}`}>
        {won
          ? `Solved! Score: ${terminal?.score ?? 0}`
          : `Moves: ${state.moves} — draw a loop; numbers show visible cells`}
      </div>

      <div className="corral-canvas-wrapper">
        <canvas
          ref={canvasRef}
          width={W}
          height={W}
          onClick={handleClick}
          style={{ display: "block" }}
        />
      </div>

      <div className="corral-btns">
        <button data-testid="hint-target-corral-puzzle-action" onClick={() => dispatch({ type: "reset" } satisfies CorralAction)}>Reset</button>
      </div>
    </div>
  );
}
