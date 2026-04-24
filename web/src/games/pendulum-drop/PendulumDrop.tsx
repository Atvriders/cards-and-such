import { useEffect, useRef, useCallback } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { PendulumDropState, PendulumDropAction, PendulumDropSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./PendulumDrop.css";

const PW = 400;
const PH = 420;

export function PendulumDrop({
  state,
  dispatch,
}: GameProps<PendulumDropState, PendulumDropSettings>): JSX.Element {
  const stateRef = useRef(state);
  stateRef.current = state;
  const rafRef = useRef<number | null>(null);
  const lastRef = useRef<number | null>(null);

  const tick = useCallback((now: number) => {
    const s = stateRef.current;
    if (s.over) { rafRef.current = null; return; }
    if (lastRef.current !== null) {
      const dt = Math.min((now - lastRef.current) / 1000, 0.05);
      dispatch({ type: "tick", dt } as PendulumDropAction);
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

    // Sky
    ctx.fillStyle = "#e8f0ff";
    ctx.fillRect(0, 0, PW, PH);

    // Cups
    const cupColors = ["#4488cc", "#cc4444", "#44aa44"];
    state.cups.forEach((cup, i) => {
      const cx = cup.x * PW;
      const cy = 0.85 * PH;
      ctx.fillStyle = cupColors[i] ?? "#888";
      ctx.beginPath();
      ctx.moveTo(cx - 22, cy);
      ctx.lineTo(cx + 22, cy);
      ctx.lineTo(cx + 18, cy + 28);
      ctx.lineTo(cx - 18, cy + 28);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "white";
      ctx.font = "bold 13px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(`${cup.pts}`, cx, cy + 18);
      ctx.textAlign = "left";
    });

    // Pivot
    const px = state.pivotX * PW;
    const py = state.pivotY * PH;
    ctx.fillStyle = "#555";
    ctx.beginPath();
    ctx.arc(px, py, 5, 0, Math.PI * 2);
    ctx.fill();

    // Rope (only when not released)
    if (!state.released) {
      const bx = state.ballX * PW;
      const by = state.ballY * PH;
      ctx.strokeStyle = "#888";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(px, py);
      ctx.lineTo(bx, by);
      ctx.stroke();
    }

    // Ball
    ctx.beginPath();
    ctx.arc(state.ballX * PW, state.ballY * PH, 12, 0, Math.PI * 2);
    ctx.fillStyle = "#ff6633";
    ctx.fill();
    ctx.strokeStyle = "#cc3300";
    ctx.lineWidth = 2;
    ctx.stroke();
  });

  const terminal = isTerminal(state);

  return (
    <div className="pend-game">
      <div className="pend-hud">
        <span>Swings: {state.totalSwings - state.swingsUsed} left</span>
        <span>Score: {state.score}</span>
        {state.lastScore !== null && (
          <span className={state.lastScore >= 30 ? "pend-good" : "pend-ok"}>
            {state.lastScore > 0 ? `+${state.lastScore}` : "Miss!"}
          </span>
        )}
      </div>
      <div style={{ position: "relative" }}>
        <canvas ref={canvasRef} className="pend-canvas" width={PW} height={PH} />
        {terminal && (
          <div className="pend-overlay">
            <h2>Done!</h2>
            <p>Final: {terminal.score} pts</p>
          </div>
        )}
      </div>
      <button
        className="pend-release-btn"
        disabled={state.released || state.over}
        onClick={() => dispatch({ type: "release" } as PendulumDropAction)}>
        RELEASE!
      </button>
      <div className="pend-hint">Watch the pendulum swing — tap RELEASE to drop the ball into a cup!</div>
    </div>
  );
}
