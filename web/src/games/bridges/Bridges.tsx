import { useEffect, useRef, useCallback } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { BridgesState, BridgesSettings } from "./state.js";
import type { BridgesAction } from "./state.js";
import { isTerminal, islandBridgeCount } from "./state.js";
import "./Bridges.css";

const CELL = 60;
const PAD = 20;

export function Bridges({ state, dispatch, onGameOver }: GameProps<BridgesState, BridgesSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { puzzle, bridges, won } = state;
  const { size, grid } = puzzle;
  const W = size * CELL + PAD * 2;

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, W, W);

    // Draw bridges
    for (const b of bridges) {
      const x1 = PAD + b.c1 * CELL;
      const y1 = PAD + b.r1 * CELL;
      const x2 = PAD + b.c2 * CELL;
      const y2 = PAD + b.r2 * CELL;
      const isH = b.r1 === b.r2;
      ctx.strokeStyle = "#1565c0";
      ctx.lineWidth = 3;
      if (b.count === 1) {
        ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
      } else {
        const offset = isH ? 5 : 5;
        ctx.beginPath();
        ctx.moveTo(x1, y1 - (isH ? offset : 0)); ctx.lineTo(x2, y2 - (isH ? offset : 0));
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x1, y1 + (isH ? offset : 0)); ctx.lineTo(x2, y2 + (isH ? offset : 0));
        ctx.stroke();
      }
    }

    // Draw islands
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        const v = grid[r * size + c] ?? null;
        if (v === null || v === undefined) continue;
        const x = PAD + c * CELL;
        const y = PAD + r * CELL;
        const current = islandBridgeCount(bridges, r, c);
        const done = current === v;
        const over = current > v;
        ctx.beginPath();
        ctx.arc(x, y, 18, 0, Math.PI * 2);
        ctx.fillStyle = over ? "#ffcdd2" : done ? "#c8e6c9" : "#fff";
        ctx.fill();
        ctx.strokeStyle = over ? "#c62828" : done ? "#2e7d32" : "#333";
        ctx.lineWidth = 2.5;
        ctx.stroke();
        ctx.fillStyle = "#111";
        ctx.font = "bold 15px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(String(v), x, y);
      }
    }
  }, [puzzle, bridges, W, size, grid]);

  useEffect(() => { draw(); }, [draw]);

  function findNearestIsland(px: number, py: number): [number, number] | null {
    let best: [number, number] | null = null;
    let bestD = 9999;
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (grid[r * size + c] === null) continue;
        const dx = px - (PAD + c * CELL);
        const dy = py - (PAD + r * CELL);
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < bestD) { bestD = d; best = [r, c]; }
      }
    }
    return bestD < 22 ? best : null;
  }

  const startRef = useRef<[number, number] | null>(null);

  function handleMouseDown(e: React.MouseEvent<HTMLCanvasElement>) {
    if (won) return;
    const rect = canvasRef.current!.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;
    startRef.current = findNearestIsland(px, py);
  }

  function handleMouseUp(e: React.MouseEvent<HTMLCanvasElement>) {
    if (won || !startRef.current) return;
    const rect = canvasRef.current!.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;
    const end = findNearestIsland(px, py);
    const [r1, c1] = startRef.current;
    startRef.current = null;
    if (!end) return;
    const [r2, c2] = end;
    if (r1 === r2 && c1 === c2) return;
    // Must be same row or column
    if (r1 !== r2 && c1 !== c2) return;
    dispatch({ type: "addBridge", r1, c1, r2, c2 } satisfies BridgesAction);
  }

  return (
    <div className="bridgesnautical">
      <div className="bridgesnautical-title">Bridges (Hashiwokakero)</div>
      <div className={`bridgesnautical-status${won ? " win" : ""}`}>
        {won ? `Solved! Score: ${terminal?.score ?? 0}` : `Moves: ${state.moves} — connect all islands`}
      </div>

      <div className="bridgesnautical-canvas-wrap">
        <canvas
          ref={canvasRef}
          width={W}
          height={W}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
        />
      </div>

      <div className="bridgesnautical-hint">
        Drag from island to island to draw a bridge. Click same pair again for double bridge, again to remove.
      </div>

      <div className="bridgesnautical-btns">
        <button data-testid="hint-target-bridges-action" onClick={() => dispatch({ type: "reset" })}>Reset</button>
      </div>
    </div>
  );
}
