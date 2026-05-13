import { useEffect, useRef, useCallback } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { MarbleDropState, MarbleDropAction, MarbleDropSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./MarbleDrop.css";

const PW = 400;
const PH = 460;
const NUM_SLOTS = 7;

const MARBLE_COLORS = ["#ff4444", "#4488ff", "#44cc44", "#ffaa22", "#cc44cc", "#22dddd", "#ff8844"];

export function MarbleDrop({
  state,
  dispatch,
  onGameOver,
}: GameProps<MarbleDropState, MarbleDropSettings>): JSX.Element {
  const stateRef = useRef(state);
  stateRef.current = state;
  const endedRef = useRef(false);
  useEffect(() => {
    const t = isTerminal(state);
    if (t && !endedRef.current) {
      endedRef.current = true;
      onGameOver(t.score);
    }
  }, [state, onGameOver]);
  const rafRef = useRef<number | null>(null);
  const lastRef = useRef<number | null>(null);

  const tick = useCallback((now: number) => {
    const s = stateRef.current;
    if (s.over) { rafRef.current = null; return; }
    if (lastRef.current !== null) {
      const dt = Math.min((now - lastRef.current) / 1000, 0.033);
      dispatch({ type: "tick", dt } as MarbleDropAction);
    }
    lastRef.current = now;
    rafRef.current = requestAnimationFrame(tick);
  }, [dispatch]);

  useEffect(() => {
    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current !== null) cancelAnimationFrame(rafRef.current); };
  }, [tick]);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, PW, PH);

    // Background
    ctx.fillStyle = "#f8f0e0";
    ctx.fillRect(0, 0, PW, PH);

    // Slot dividers and values
    const slotW = PW / NUM_SLOTS;
    const slotColors = ["#ccddff", "#aaccff", "#88bbff", "#ffddaa", "#88bbff", "#aaccff", "#ccddff"];
    state.slotValues.forEach((val, i) => {
      ctx.fillStyle = slotColors[i] ?? "#ddd";
      ctx.fillRect(i * slotW + 1, PH * 0.88, slotW - 2, PH * 0.12);
      ctx.strokeStyle = "#999";
      ctx.lineWidth = 1;
      ctx.strokeRect(i * slotW + 1, PH * 0.88, slotW - 2, PH * 0.12);
      ctx.fillStyle = "#333";
      ctx.font = "bold 14px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(`${val}`, (i + 0.5) * slotW, PH * 0.88 + 30);
      ctx.textAlign = "left";
    });

    // Pegs
    state.pegs.forEach(peg => {
      ctx.beginPath();
      ctx.arc(peg.x * PW, peg.y * PH, 0.025 * PW, 0, Math.PI * 2);
      ctx.fillStyle = "#666";
      ctx.fill();
    });

    // Marbles
    state.marbles.forEach((m, i) => {
      ctx.beginPath();
      ctx.arc(m.x * PW, m.y * PH, 0.02 * PW, 0, Math.PI * 2);
      ctx.fillStyle = MARBLE_COLORS[i % MARBLE_COLORS.length] ?? "#888";
      ctx.fill();
      ctx.strokeStyle = "rgba(0,0,0,0.3)";
      ctx.lineWidth = 1;
      ctx.stroke();
    });
  });

  const terminal = isTerminal(state);
  const remaining = state.totalMarbles - state.marblesDropped;

  function handleCanvasClick(e: React.MouseEvent<HTMLCanvasElement>) {
    if (state.over || remaining <= 0) return;
    const rect = canvasRef.current!.getBoundingClientRect();
    const scaleX = PW / rect.width;
    const x = (e.clientX - rect.left) * scaleX / PW;
    dispatch({ type: "drop", x } as MarbleDropAction);
  }

  return (
    <div className="marble-game">
      <div className="marble-hud">
        <span>Marbles: {remaining} left</span>
        <span>Score: {state.score}</span>
      </div>
      <div style={{ position: "relative" }}>
        <canvas
          ref={canvasRef}
          className="marble-canvas"
          width={PW}
          height={PH}
          onClick={handleCanvasClick}
        />
        {terminal && (
          <div className="marble-overlay">
            <h2>Done!</h2>
            <p>Final: {terminal.score} pts</p>
          </div>
        )}
      </div>
      <div className="marble-hint">
        {remaining > 0 ? "Click above the pegs to drop a marble!" : "Waiting for marbles to settle..."}
      </div>
    </div>
  );
}
