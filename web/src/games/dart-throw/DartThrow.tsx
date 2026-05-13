import { useEffect, useRef, useState } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DartThrowState, DartThrowAction, DartThrowSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./DartThrow.css";

const SIZE = 360;
const CX = SIZE / 2;
const CY = SIZE / 2;
const MAX_R = 160;

const RING_COLORS = ["#008000", "#008000", "#cc0000", "#cc0000", "#000080", "#000080", "#cccccc", "#cccccc", "#aaaaaa", "#aaaaaa"];

export function DartThrow({
  state,
  dispatch,
  onGameOver,
}: GameProps<DartThrowState, DartThrowSettings>): JSX.Element {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [dragging, setDragging] = useState(false);
  const startRef = useRef<{ x: number; y: number } | null>(null);
  const endedRef = useRef(false);
  useEffect(() => {
    const t = isTerminal(state);
    if (t && !endedRef.current) {
      endedRef.current = true;
      onGameOver(t.score);
    }
  }, [state, onGameOver]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, SIZE, SIZE);

    // Draw dartboard rings (outermost to inner)
    for (let i = 10; i >= 1; i--) {
      const r = (i / 10) * MAX_R;
      ctx.beginPath();
      ctx.arc(CX, CY, r, 0, Math.PI * 2);
      ctx.fillStyle = RING_COLORS[10 - i] ?? "#fff";
      ctx.fill();
      ctx.strokeStyle = "#111";
      ctx.lineWidth = 1;
      ctx.stroke();
    }
    // Bull
    ctx.beginPath();
    ctx.arc(CX, CY, MAX_R * 0.05, 0, Math.PI * 2);
    ctx.fillStyle = "#cc0000";
    ctx.fill();

    // Draw last hit
    if (state.lastHit) {
      const hx = CX + state.lastHit.x * MAX_R;
      const hy = CY + state.lastHit.y * MAX_R;
      ctx.fillStyle = "#222";
      ctx.beginPath();
      ctx.arc(hx, hy, 5, 0, Math.PI * 2);
      ctx.fill();
      // Dart shaft
      ctx.strokeStyle = "#888";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(hx, hy);
      ctx.lineTo(hx - 12, hy - 30);
      ctx.stroke();
    }

    // Aim crosshair while dragging
    if (dragging) {
      const ax = CX + state.throwX * MAX_R;
      const ay = CY + state.throwY * MAX_R;
      ctx.strokeStyle = "rgba(255,255,0,0.9)";
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(ax - 14, ay); ctx.lineTo(ax + 14, ay); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(ax, ay - 14); ctx.lineTo(ax, ay + 14); ctx.stroke();
    }
  });

  function getCanvasXY(e: React.PointerEvent<HTMLCanvasElement>) {
    const rect = canvasRef.current!.getBoundingClientRect();
    const scaleX = SIZE / rect.width;
    const scaleY = SIZE / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  }

  function onPointerDown(e: React.PointerEvent<HTMLCanvasElement>) {
    if (state.over) return;
    const { x, y } = getCanvasXY(e);
    startRef.current = { x, y };
    setDragging(true);
    const dx = (x - CX) / MAX_R;
    const dy = (y - CY) / MAX_R;
    dispatch({ type: "aim", dx, dy } as DartThrowAction);
  }

  function onPointerMove(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!dragging) return;
    const { x, y } = getCanvasXY(e);
    const dx = (x - CX) / MAX_R;
    const dy = (y - CY) / MAX_R;
    dispatch({ type: "aim", dx, dy } as DartThrowAction);
  }

  function onPointerUp() {
    if (!dragging) return;
    setDragging(false);
    dispatch({ type: "throw" } as DartThrowAction);
  }

  const terminal = isTerminal(state);

  return (
    <div className="dart-game fade-in">
      <div className="dart-hud">
        <span>Darts: {state.totalDarts - state.dartsThrown} left</span>
        <span>Score: {state.score}</span>
        {state.lastHit && (
          <span className={state.lastHit.pts >= 25 ? "dart-great" : "dart-ok"}>
            {state.lastHit.pts === 50 ? "Bull!" : `+${state.lastHit.pts}`}
          </span>
        )}
      </div>
      <div style={{ position: "relative" }}>
        <canvas
          ref={canvasRef}
          className="dart-canvas"
          width={SIZE}
          height={SIZE}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerLeave={onPointerUp}
        />
        {terminal && (
          <div className="dart-overlay">
            <h2>Game Over</h2>
            <p>Final: {terminal.score} pts</p>
          </div>
        )}
      </div>
      <div className="dart-hint">Tap or click on the board to aim — release to throw!</div>
    </div>
  );
}
