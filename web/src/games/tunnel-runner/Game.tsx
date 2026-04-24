import { useEffect, useRef, useCallback } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { TunnelRunnerState, TunnelRunnerAction } from "./state.js";
import { isTerminal, NUM_SEGMENTS, PLAYER_W } from "./state.js";
import "./Game.css";

const PW = 400;
const PH = 520;
const SEG_H = PH / NUM_SEGMENTS;

type Settings = { difficulty: "easy" | "normal" | "hard" };

export function TunnelRunner({ state, dispatch }: GameProps<TunnelRunnerState, Settings>): JSX.Element {
  const stateRef = useRef(state);
  stateRef.current = state;

  const rafRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const renderCanvas = useCallback((s: TunnelRunnerState) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, PW, PH);

    // Background
    ctx.fillStyle = "#060614";
    ctx.fillRect(0, 0, PW, PH);

    // Draw tunnel segments from bottom (player at ~75%) to top
    const segs = s.segments;
    const playerSegIdx = Math.floor(NUM_SEGMENTS * 0.75);

    for (let i = 0; i < NUM_SEGMENTS; i++) {
      const seg = segs[i];
      if (!seg) continue;
      const y = i * SEG_H;

      // Left wall
      const gradient = ctx.createLinearGradient(0, y, seg.leftX * PW, y);
      gradient.addColorStop(0, "#1a0a30");
      gradient.addColorStop(1, "#2a1050");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, y, seg.leftX * PW, SEG_H + 1);

      // Right wall
      const gradient2 = ctx.createLinearGradient(seg.rightX * PW, y, PW, y);
      gradient2.addColorStop(0, "#2a1050");
      gradient2.addColorStop(1, "#1a0a30");
      ctx.fillStyle = gradient2;
      ctx.fillRect(seg.rightX * PW, y, PW - seg.rightX * PW, SEG_H + 1);

      // Tunnel edges glow
      if (i === playerSegIdx) {
        ctx.strokeStyle = "rgba(100,80,200,0.6)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(seg.leftX * PW, y);
        ctx.lineTo(seg.leftX * PW, y + SEG_H);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(seg.rightX * PW, y);
        ctx.lineTo(seg.rightX * PW, y + SEG_H);
        ctx.stroke();
      }
    }

    // Draw player
    const playerY = playerSegIdx * SEG_H + SEG_H / 2;
    const px = s.playerX * PW;
    const pw = PLAYER_W * PW;
    const ph = SEG_H * 1.5;

    ctx.fillStyle = s.over ? "#ff3030" : "#40e0ff";
    ctx.shadowColor = s.over ? "#ff3030" : "#40e0ff";
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.roundRect(px - pw / 2, playerY - ph / 2, pw, ph, 4);
    ctx.fill();
    ctx.shadowBlur = 0;
  }, []);

  const tick = useCallback((now: number) => {
    const s = stateRef.current;
    if (!s.over) {
      if (lastTimeRef.current !== null) {
        const dt = Math.min((now - lastTimeRef.current) / 1000, 0.05);
        dispatch({ type: "tick", dt } as TunnelRunnerAction);
      }
      lastTimeRef.current = now;
      rafRef.current = requestAnimationFrame(tick);
    }
    renderCanvas(stateRef.current);
  }, [dispatch, renderCanvas]);

  useEffect(() => {
    renderCanvas(state);
    if (!state.over) {
      rafRef.current = requestAnimationFrame(tick);
    }
    return () => {
      if (rafRef.current !== null) { cancelAnimationFrame(rafRef.current); rafRef.current = null; lastTimeRef.current = null; }
    };
  }, [state.over, tick, renderCanvas, state]);

  const wrapRef = useRef<HTMLDivElement>(null);

  const onPointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    const rect = wrapRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = (e.clientX - rect.left) / rect.width;
    dispatch({ type: "move", x } as TunnelRunnerAction);
  }, [dispatch]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const step = 0.025;
      if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") {
        e.preventDefault();
        dispatch({ type: "nudge", dx: -step } as TunnelRunnerAction);
      }
      if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") {
        e.preventDefault();
        dispatch({ type: "nudge", dx: step } as TunnelRunnerAction);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [dispatch]);

  const terminal = isTerminal(state);

  return (
    <div className="tr-game">
      <div className="tr-header">
        <span>Score: {state.score}</span>
        <span>Distance: {Math.floor(state.distance)}m</span>
      </div>

      <div
        className="tr-canvas-wrap"
        ref={wrapRef}
        style={{ width: PW, height: PH }}
        onPointerMove={onPointerMove}
      >
        <canvas ref={canvasRef} width={PW} height={PH} className="tr-canvas" />

        {terminal && (
          <div className="tr-overlay">
            <h2>Crashed!</h2>
            <p>Score: {terminal.score}</p>
            <p>Distance: {Math.floor(state.distance)}m</p>
          </div>
        )}
      </div>

      <div className="tr-hint">Mouse or A/D to steer · Don't touch the walls!</div>
    </div>
  );
}
