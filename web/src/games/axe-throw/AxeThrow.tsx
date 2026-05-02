import { useEffect, useRef, useCallback } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { AxeThrowState, AxeThrowAction, AxeThrowSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./AxeThrow.css";

const PW = 480;
const PH = 320;
const LOG_X = 0.85 * PW;
const LOG_Y = 0.5 * PH;
const LOG_R = 0.12 * PW;

export function AxeThrow({
  state,
  dispatch,
}: GameProps<AxeThrowState, AxeThrowSettings>): JSX.Element {
  const stateRef = useRef(state);
  stateRef.current = state;
  const rafRef = useRef<number | null>(null);
  const lastRef = useRef<number | null>(null);

  const tick = useCallback((now: number) => {
    const s = stateRef.current;
    if (s.over) { rafRef.current = null; return; }
    if (lastRef.current !== null) {
      const dt = Math.min((now - lastRef.current) / 1000, 0.05);
      dispatch({ type: "tick", dt } as AxeThrowAction);
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
    ctx.fillStyle = "#2a1a0a";
    ctx.fillRect(0, 0, PW, PH);

    // Floor
    ctx.fillStyle = "#5a3a1a";
    ctx.fillRect(0, PH * 0.8, PW, PH * 0.2);

    // Log (target)
    ctx.beginPath();
    ctx.arc(LOG_X, LOG_Y, LOG_R, 0, Math.PI * 2);
    ctx.fillStyle = "#8b5a2b";
    ctx.fill();
    // Log rings
    for (let r = LOG_R * 0.75; r > LOG_R * 0.15; r -= LOG_R * 0.2) {
      ctx.beginPath();
      ctx.arc(LOG_X, LOG_Y, r, 0, Math.PI * 2);
      ctx.strokeStyle = "#6b4a1b";
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }
    // Bullseye
    ctx.beginPath();
    ctx.arc(LOG_X, LOG_Y, LOG_R * 0.12, 0, Math.PI * 2);
    ctx.fillStyle = "#cc4400";
    ctx.fill();

    // Swing power bar
    if (!state.throwing && !state.over) {
      const swingVal = Math.sin(state.swingPhase);
      const barW = 120;
      const bx = 30;
      const by = PH - 40;
      ctx.fillStyle = "#333";
      ctx.fillRect(bx, by, barW, 16);
      const fillW = ((swingVal + 1) / 2) * barW;
      ctx.fillStyle = swingVal > 0.7 ? "#22aa44" : swingVal > 0.3 ? "#aacc22" : "#cc8822";
      ctx.fillRect(bx, by, fillW, 16);
      ctx.strokeStyle = "#888";
      ctx.lineWidth = 1;
      ctx.strokeRect(bx, by, barW, 16);
      ctx.fillStyle = "#ccc";
      ctx.font = "11px monospace";
      ctx.fillText("Aim", bx, by - 4);
    }

    // Axe
    const ax = state.axeX * PW;
    const ay = state.axeY * PH;
    ctx.save();
    ctx.translate(ax, ay);
    ctx.rotate(state.axeAngle);
    // Blade
    ctx.fillStyle = "#aaaacc";
    ctx.beginPath();
    ctx.moveTo(12, 0);
    ctx.lineTo(-4, -10);
    ctx.lineTo(-8, 0);
    ctx.lineTo(-4, 10);
    ctx.closePath();
    ctx.fill();
    // Handle
    ctx.strokeStyle = "#8b5a2b";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(-8, 0);
    ctx.lineTo(-30, 0);
    ctx.stroke();
    ctx.restore();
  });

  const terminal = isTerminal(state);

  return (
    <div className="axe-game">
      <div className="axe-hud">
        <span>Round {state.round}/{state.totalRounds}</span>
        <span>Score: {state.score}</span>
        {state.lastScore !== null && (
          <span className={state.lastScore > 0 ? "axe-hit" : "axe-miss"}>
            {state.lastScore > 0 ? `+${state.lastScore} Sticks!` : "Bounced!"}
          </span>
        )}
      </div>
      <div style={{ position: "relative" }}>
        <canvas ref={canvasRef} className="axe-canvas" width={PW} height={PH} />
        {terminal && (
          <div className="axe-overlay">
            <h2>Done!</h2>
            <p>Score: {terminal.score}</p>
          </div>
        )}
      </div>
      <div className="axe-controls">
        {!state.over && !state.landed && (
          <button data-testid="hint-target-axe-throw-action" className="axe-throw-btn" disabled={state.throwing}
            onClick={() => dispatch({ type: "throw" } as AxeThrowAction)}>
            THROW!
          </button>
        )}
        {state.landed && !state.over && (
          <button className="axe-throw-btn" onClick={() => dispatch({ type: "nextRound" } as AxeThrowAction)}>
            Next Round
          </button>
        )}
      </div>
      <div className="axe-hint">Watch the aim bar — throw when it's in the green for best accuracy!</div>
    </div>
  );
}
