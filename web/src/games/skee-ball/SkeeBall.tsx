import { useEffect, useRef, useCallback } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { SkeeBallState, SkeeBallAction, SkeeBallSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./SkeeBall.css";

const PW = 320;
const PH = 480;
// Target zone center on canvas
const TGT_X = PW / 2;
const TGT_Y = PH * 0.3;
const MAX_R = 110;
// Lane/ball area
const LANE_Y_START = PH * 0.55;
const LANE_Y_END = PH * 0.92;

const RING_COLORS = ["#2244aa", "#3366cc", "#44aacc", "#22cc88", "#ffcc00"];
const RING_SCORES = [10, 20, 40, 60, 100];

export function SkeeBall({
  state,
  dispatch,
}: GameProps<SkeeBallState, SkeeBallSettings>): JSX.Element {
  const stateRef = useRef(state);
  stateRef.current = state;
  const rafRef = useRef<number | null>(null);
  const lastRef = useRef<number | null>(null);

  const tick = useCallback((now: number) => {
    const s = stateRef.current;
    if (s.over) { rafRef.current = null; return; }
    if (lastRef.current !== null) {
      const dt = Math.min((now - lastRef.current) / 1000, 0.05);
      dispatch({ type: "tick", dt } as SkeeBallAction);
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
    ctx.fillStyle = "#1a1a2e";
    ctx.fillRect(0, 0, PW, PH);

    // Lane
    ctx.fillStyle = "#3a2a1a";
    ctx.fillRect(PW * 0.2, LANE_Y_START, PW * 0.6, LANE_Y_END - LANE_Y_START);
    ctx.strokeStyle = "#5a4a2a";
    ctx.lineWidth = 2;
    ctx.strokeRect(PW * 0.2, LANE_Y_START, PW * 0.6, LANE_Y_END - LANE_Y_START);

    // Target rings (outer to inner)
    const RING_RADII = [1.0, 0.75, 0.5, 0.3, 0.12];
    for (let i = 0; i < 5; i++) {
      const r = RING_RADII[i]! * MAX_R;
      ctx.beginPath();
      ctx.arc(TGT_X, TGT_Y, r, 0, Math.PI * 2);
      ctx.fillStyle = RING_COLORS[i] ?? "#888";
      ctx.fill();
      ctx.strokeStyle = "#222";
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.fillStyle = "white";
      ctx.font = "bold 11px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(`${RING_SCORES[i]}`, TGT_X, TGT_Y - RING_RADII[i]! * MAX_R + 14);
      ctx.textAlign = "left";
    }

    // Ball in flight
    if (state.ballInFlight) {
      const t = state.ballT;
      // Simple arc: starts at bottom of lane, arcs up to target
      const startX = PW / 2 + state.launchLane * PW * 0.2;
      const startY = LANE_Y_END - 20;
      const endX = TGT_X + state.landX * MAX_R;
      const endY = TGT_Y + state.landY * MAX_R;
      const bx = startX + (endX - startX) * t;
      const by = startY + (endY - startY) * t - Math.sin(t * Math.PI) * 80;
      const radius = 14 * (1 - t * 0.3); // shrinks as it goes away
      ctx.beginPath();
      ctx.arc(bx, by, radius, 0, Math.PI * 2);
      ctx.fillStyle = "#ff8844";
      ctx.fill();
      ctx.strokeStyle = "#cc5522";
      ctx.lineWidth = 2;
      ctx.stroke();
    } else if (!state.over) {
      // Ball at start
      const ballX = PW / 2 + state.launchLane * PW * 0.2;
      ctx.beginPath();
      ctx.arc(ballX, LANE_Y_END - 20, 14, 0, Math.PI * 2);
      ctx.fillStyle = "#ff8844";
      ctx.fill();
      ctx.strokeStyle = "#cc5522";
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    // Power bar
    if (!state.ballInFlight && !state.over) {
      const barX = 12;
      const barY = PH - 30;
      const barW = 80;
      ctx.fillStyle = "#333";
      ctx.fillRect(barX, barY, barW, 14);
      ctx.fillStyle = state.launchPower > 0.65 && state.launchPower < 0.85 ? "#22cc44" : "#cc8822";
      ctx.fillRect(barX, barY, barW * state.launchPower, 14);
      ctx.strokeStyle = "#888";
      ctx.lineWidth = 1;
      ctx.strokeRect(barX, barY, barW, 14);
      ctx.fillStyle = "#ccc";
      ctx.font = "10px monospace";
      ctx.fillText("Power", barX, barY - 3);
    }
  });

  const terminal = isTerminal(state);

  return (
    <div className="skeeball-game">
      <div className="skeeball-hud">
        <span>Balls: {state.totalBalls - state.ballsThrown}</span>
        <span>Score: {state.score}</span>
        {state.lastScore !== null && (
          <span className={state.lastScore >= 60 ? "skee-great" : "skee-ok"}>
            {state.lastScore > 0 ? `+${state.lastScore}` : "Miss!"}
          </span>
        )}
      </div>
      <div style={{ position: "relative" }}>
        <canvas ref={canvasRef} className="skeeball-canvas" width={PW} height={PH} />
        {terminal && (
          <div className="skeeball-overlay">
            <h2>Game Over</h2>
            <p>Total: {terminal.score}</p>
          </div>
        )}
      </div>
      <div className="skeeball-controls">
        <label>
          Lane offset
          <input type="range" min={-100} max={100} value={Math.round(state.launchLane * 100)}
            onChange={e => dispatch({ type: "setLane", lane: parseInt(e.target.value) / 100 } as SkeeBallAction)} />
        </label>
        <button className="skee-throw-btn"
          disabled={state.ballInFlight || state.over || state.ballsThrown >= state.totalBalls}
          onClick={() => dispatch({ type: "throw" } as SkeeBallAction)}>
          ROLL!
        </button>
      </div>
      <div className="skeeball-hint">Watch the power bar — throw in the green zone for center rings!</div>
    </div>
  );
}
