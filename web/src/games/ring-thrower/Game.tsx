import { useEffect, useRef, useCallback } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { RingThrowerState, RingThrowerAction, RingThrowerSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

const PW = 420;
const PH = 520;
const RING_R_PX = 0.028 * PH;

const PEG_COLORS: Record<number, string> = {
  10: "#f44",
  5:  "#f80",
  3:  "#dd0",
  1:  "#aaa",
};

export function RingThrowerGame({
  state,
  dispatch,
  onGameOver,
}: GameProps<RingThrowerState, RingThrowerSettings>): JSX.Element {
  const stateRef = useRef(state);
  stateRef.current = state;
  const rafRef = useRef<number | null>(null);
  const lastRef = useRef<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const endedRef = useRef(false);

  const tick = useCallback(
    (now: number) => {
      const s = stateRef.current;
      if (s.over || s.phase === "result" || s.phase === "done") { rafRef.current = null; lastRef.current = null; return; }
      if (lastRef.current !== null) {
        const dt = Math.min((now - lastRef.current) / 1000, 0.05);
        dispatch({ type: "tick", dt } as RingThrowerAction);
      }
      lastRef.current = now;
      rafRef.current = requestAnimationFrame(tick);
    },
    [dispatch],
  );

  useEffect(() => {
    if (!state.over && state.phase !== "result" && state.phase !== "done") {
      rafRef.current = requestAnimationFrame(tick);
    }
    return () => {
      if (rafRef.current !== null) { cancelAnimationFrame(rafRef.current); rafRef.current = null; lastRef.current = null; }
    };
  }, [state.over, state.phase, tick]);

  useEffect(() => {
    function dn(e: KeyboardEvent) {
      if (e.key === " " || e.key === "Enter") { e.preventDefault(); dispatch({ type: "tap" } as RingThrowerAction); }
    }
    window.addEventListener("keydown", dn);
    return () => window.removeEventListener("keydown", dn);
  }, [dispatch]);

  // Draw
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = "#1a2a1a";
    ctx.fillRect(0, 0, PW, PH);

    // Ground line
    ctx.strokeStyle = "#4a8";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, 0.9 * PH);
    ctx.lineTo(PW, 0.9 * PH);
    ctx.stroke();

    // Pegs
    state.pegs.forEach((peg) => {
      const px = peg.x * PW;
      const py = peg.y * PH;
      const pr = peg.radius * PH;
      ctx.strokeStyle = PEG_COLORS[peg.points] ?? "#fff";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(px, py, pr, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = PEG_COLORS[peg.points] ?? "#fff";
      ctx.font = `bold ${Math.floor(pr * 0.8)}px sans-serif`;
      ctx.textAlign = "center";
      ctx.fillText(`${peg.points}`, px, py + pr * 0.3);
    });
    ctx.textAlign = "left";

    // Aim arrow (during pickAngle / pickPower)
    const thrX = 0.5 * PW;
    const thrY = 0.92 * PH;

    if (state.phase === "pickAngle" || state.phase === "pickPower") {
      const aimLen = 60 + state.power * 40;
      ctx.strokeStyle = "#8ff";
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 4]);
      ctx.beginPath();
      ctx.moveTo(thrX, thrY);
      ctx.lineTo(thrX + Math.cos(state.angle) * aimLen, thrY + Math.sin(state.angle) * aimLen);
      ctx.stroke();
      ctx.setLineDash([]);

      // Power bar
      if (state.phase === "pickPower") {
        ctx.fillStyle = "#333";
        ctx.fillRect(12, PH - 22, 120, 12);
        ctx.fillStyle = `hsl(${(1 - state.power) * 120}, 80%, 50%)`;
        ctx.fillRect(12, PH - 22, state.power * 120, 12);
        ctx.strokeStyle = "#888";
        ctx.lineWidth = 1;
        ctx.strokeRect(12, PH - 22, 120, 12);
      }
    }

    // Thrower
    ctx.fillStyle = "#aaa";
    ctx.beginPath();
    ctx.arc(thrX, thrY, 12, 0, Math.PI * 2);
    ctx.fill();

    // Flying ring
    if (state.ring) {
      const rx = state.ring.x * PW;
      const ry = state.ring.y * PH;
      const rr = RING_R_PX;
      ctx.strokeStyle = "#ffd700";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(rx, ry, rr, 0, Math.PI * 2);
      ctx.stroke();
    }

    // HUD
    ctx.fillStyle = "#cfc";
    ctx.font = "bold 14px sans-serif";
    ctx.fillText(`Score: ${state.score}`, 8, 22);
    ctx.fillText(`Throws left: ${state.throwsLeft}`, 8, 44);

    // Phase instructions
    ctx.fillStyle = "#aef";
    ctx.font = "13px sans-serif";
    const inst = state.phase === "pickAngle"
      ? "Tap to lock angle"
      : state.phase === "pickPower"
      ? "Tap to set power and throw!"
      : state.phase === "result"
      ? state.lastPoints ? `+${state.lastPoints} points! Tap to continue` : "Miss! Tap to continue"
      : state.phase === "done"
      ? `Done! Final score: ${state.score}`
      : "";
    ctx.fillText(inst, 8, PH - 8);
  });

  const terminal = isTerminal(state);

  useEffect(() => {
    if (terminal && !endedRef.current) {
      endedRef.current = true;
      onGameOver(terminal.score);
    }
  }, [terminal, onGameOver]);

  return (
    <div className="ring-game fade-in">
      <div style={{ position: "relative" }}>
        <canvas
          ref={canvasRef}
          className="ring-canvas"
          width={PW}
          height={PH}
          onClick={() => dispatch({ type: "tap" } as RingThrowerAction)}
        />
        {terminal && (
          <div className="arcade-overlay">
            <h2>All Throws Used!</h2>
            <p>Final Score: {terminal.score}</p>
          </div>
        )}
      </div>
      <div className="arcade-controls">
        <button data-testid="hint-target-ring-thrower-action" className="arcade-btn" onClick={() => dispatch({ type: "tap" } as RingThrowerAction)}>
          Tap (Space)
        </button>
      </div>
      <div className="arcade-hint">Tap 1: lock angle. Tap 2: lock power + throw. 10 throws total.</div>
    </div>
  );
}
