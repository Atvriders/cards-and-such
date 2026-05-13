import { useEffect, useRef, useCallback } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { ArcheryTargetState, ArcheryTargetAction, ArcheryTargetSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./ArcheryTarget.css";

const PW = 400;
const PH = 400;
const CX = PW / 2;
const CY = PH / 2;
const MAX_R = 160;

const RING_COLORS = ["#ffff00", "#ffff00", "#ff0000", "#ff0000", "#000080", "#000080", "#333", "#333", "#fff", "#fff"];

export function ArcheryTarget({
  state,
  dispatch,
  onGameOver,
}: GameProps<ArcheryTargetState, ArcheryTargetSettings>): JSX.Element {
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
  const holdingRef = useRef(false);

  const tick = useCallback((now: number) => {
    const s = stateRef.current;
    if (s.over) { rafRef.current = null; return; }
    if (holdingRef.current && !s.arrowInFlight) {
      if (lastRef.current !== null) {
        const dt = Math.min((now - lastRef.current) / 1000, 0.05);
        dispatch({ type: "tick", dt } as ArcheryTargetAction);
      }
      lastRef.current = now;
    }
    rafRef.current = requestAnimationFrame(tick);
  }, [dispatch]);

  useEffect(() => {
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [tick]);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, PW, PH);

    // Background
    ctx.fillStyle = "#dde8cc";
    ctx.fillRect(0, 0, PW, PH);

    // Draw rings
    for (let i = 10; i >= 1; i--) {
      const r = (i / 10) * MAX_R;
      ctx.beginPath();
      ctx.arc(CX, CY, r, 0, Math.PI * 2);
      ctx.fillStyle = RING_COLORS[10 - i] ?? "#fff";
      ctx.fill();
      ctx.strokeStyle = "#888";
      ctx.lineWidth = 0.5;
      ctx.stroke();
    }

    // Crosshair (aim indicator)
    if (!state.over) {
      const ax = CX + state.aimX * MAX_R;
      const ay = CY + state.aimY * MAX_R;
      ctx.strokeStyle = "rgba(0,0,0,0.7)";
      ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(ax - 12, ay); ctx.lineTo(ax + 12, ay); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(ax, ay - 12); ctx.lineTo(ax, ay + 12); ctx.stroke();
      ctx.beginPath();
      ctx.arc(ax, ay, 8, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(255,50,50,0.8)";
      ctx.stroke();
    }

    // Wind arrow
    const wx = state.windX;
    const wy = state.windY;
    const wlen = Math.sqrt(wx * wx + wy * wy);
    if (wlen > 0.01) {
      const nx = wx / wlen;
      const ny = wy / wlen;
      const startX = 30;
      const startY = 30;
      const endX = startX + nx * wlen * 60;
      const endY = startY + ny * wlen * 60;
      ctx.strokeStyle = "#2255cc";
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(startX, startY); ctx.lineTo(endX, endY); ctx.stroke();
      ctx.fillStyle = "#2255cc";
      ctx.font = "11px sans-serif";
      ctx.fillText("Wind", 10, 50);
    }
  });

  const terminal = isTerminal(state);

  function handlePointerDown() {
    if (state.over || state.arrowInFlight) return;
    holdingRef.current = true;
    lastRef.current = null;
    dispatch({ type: "startDraw" } as ArcheryTargetAction);
  }

  function handlePointerUp() {
    if (!holdingRef.current) return;
    holdingRef.current = false;
    dispatch({ type: "release" } as ArcheryTargetAction);
  }

  return (
    <div className="archery-game">
      <div className="archery-hud">
        <span>Arrows: {state.totalArrows - state.arrowsShot} left</span>
        <span>Score: {state.score}</span>
        {state.lastScore !== null && (
          <span className={state.lastScore >= 8 ? "archery-good" : "archery-ok"}>
            {state.lastScore === 10 ? "Bull's-eye!" : `+${state.lastScore}`}
          </span>
        )}
      </div>
      <div style={{ position: "relative" }}>
        <canvas
          ref={canvasRef}
          className="archery-canvas"
          width={PW}
          height={PH}
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
        />
        {terminal && (
          <div className="archery-overlay">
            <h2>Done!</h2>
            <p>Final Score: {terminal.score} / {state.totalArrows * 10}</p>
          </div>
        )}
      </div>
      <div className="archery-hint">
        {state.over ? "" : "Hold to draw — release to shoot. Watch the wind!"}
      </div>
      {!state.over && (
        <div className="archery-power-bar">
          <div className="archery-power-fill" style={{ width: `${state.drawPower}%` }} />
        </div>
      )}
    </div>
  );
}
