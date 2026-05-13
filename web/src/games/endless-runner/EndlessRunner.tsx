import { useEffect, useRef, useCallback } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { EndlessRunnerState, EndlessRunnerAction, EndlessRunnerSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./EndlessRunner.css";

const PW = 480;
const PH = 240;

// Game units: x and width in [0,1], y in [0, ~0.5]
const GROUND_Y = 0.35; // normalized game y where ground is
const SCALE_Y = PH / 0.5; // pixels per game unit (vertical)
const SCALE_X = PW; // pixels per game unit (horizontal)

function gameYtoScreenY(y: number): number {
  // y=0 is ground, y increases upward; screen y=PH at bottom
  return PH - (GROUND_Y + y) * SCALE_Y;
}

export function EndlessRunner({
  state,
  dispatch,
  onGameOver,
}: GameProps<EndlessRunnerState, EndlessRunnerSettings>): JSX.Element {
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
  const lastTimeRef = useRef<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const tick = useCallback(
    (now: number) => {
      const s = stateRef.current;
      if (s.over) { rafRef.current = null; lastTimeRef.current = null; return; }
      if (lastTimeRef.current !== null) {
        const dt = Math.min((now - lastTimeRef.current) / 1000, 0.05);
        dispatch({ type: "tick", dt } as EndlessRunnerAction);
      }
      lastTimeRef.current = now;
      rafRef.current = requestAnimationFrame(tick);
    },
    [dispatch],
  );

  useEffect(() => {
    if (!state.over) {
      rafRef.current = requestAnimationFrame(tick);
    }
    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
        lastTimeRef.current = null;
      }
    };
  }, [state.over, tick]);

  useEffect(() => {
    function dn(e: KeyboardEvent) {
      if (e.key === " " || e.key === "ArrowUp" || e.key === "w" || e.key === "W") {
        e.preventDefault();
        dispatch({ type: "jump" } as EndlessRunnerAction);
      }
      if (e.key === "ArrowDown" || e.key === "s" || e.key === "S") {
        e.preventDefault();
        dispatch({ type: "duck", on: true } as EndlessRunnerAction);
      }
    }
    function up(e: KeyboardEvent) {
      if (e.key === "ArrowDown" || e.key === "s" || e.key === "S") {
        dispatch({ type: "duck", on: false } as EndlessRunnerAction);
      }
    }
    window.addEventListener("keydown", dn);
    window.addEventListener("keyup", up);
    return () => { window.removeEventListener("keydown", dn); window.removeEventListener("keyup", up); };
  }, [dispatch]);

  // Draw
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, PW, PH);

    const groundScreenY = gameYtoScreenY(0);

    // Sky
    ctx.fillStyle = "#c8e8ff";
    ctx.fillRect(0, 0, PW, groundScreenY);
    // Ground
    ctx.fillStyle = "#8b7355";
    ctx.fillRect(0, groundScreenY, PW, PH - groundScreenY);
    ctx.fillStyle = "#6a9a4a";
    ctx.fillRect(0, groundScreenY, PW, 4);

    // Player
    const { playerY, ducking } = state;
    const PLAYER_H_NORM = 0.12;
    const PLAYER_H_DUCK = 0.06;
    const PLAYER_W = 0.04;
    const PLAYER_X = 0.15;
    const playerH = ducking ? PLAYER_H_DUCK : PLAYER_H_NORM;
    const pLeft = PLAYER_X * SCALE_X;
    const pTop = gameYtoScreenY(playerY + playerH);
    const pW = PLAYER_W * SCALE_X;
    const pH = playerH * SCALE_Y;

    // Body
    ctx.fillStyle = "#ff6633";
    ctx.fillRect(pLeft, pTop, pW, pH);
    // Head (only when not ducking)
    if (!ducking) {
      ctx.fillStyle = "#ffcc99";
      ctx.beginPath();
      ctx.arc(pLeft + pW / 2, pTop - 6, 6, 0, Math.PI * 2);
      ctx.fill();
    }

    // Obstacles
    state.obstacles.forEach((obs) => {
      if (obs.type === "low") {
        // Cactus-like: green rectangle
        const ox = obs.x * SCALE_X;
        const obH = 0.12 * SCALE_Y;
        const obW = 0.035 * SCALE_X;
        ctx.fillStyle = "#228844";
        ctx.fillRect(ox, groundScreenY - obH, obW, obH);
        // Arms
        ctx.fillRect(ox - 4, groundScreenY - obH * 0.6, 4, obH * 0.25);
        ctx.fillRect(ox + obW, groundScreenY - obH * 0.6, 4, obH * 0.25);
      } else {
        // Overhead bar
        const ox = obs.x * SCALE_X;
        const barTop = 0.08 * SCALE_Y; // from top of canvas
        const barH = 0.07 * SCALE_Y;
        const barW = 0.04 * SCALE_X;
        ctx.fillStyle = "#8833aa";
        ctx.fillRect(ox, barTop, barW, barH);
        // Hanging indicator
        ctx.strokeStyle = "#aa55cc";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(ox + barW / 2, 0);
        ctx.lineTo(ox + barW / 2, barTop);
        ctx.stroke();
      }
    });

    // Score
    ctx.fillStyle = "#335";
    ctx.font = "bold 14px sans-serif";
    ctx.fillText(`Distance: ${Math.floor(state.distance * 100)}m`, 8, 20);
  });

  const terminal = isTerminal(state);

  return (
    <div className="runner-game">
      <div className="runner-header">
        <span>Distance: {Math.floor(state.distance * 100)}m</span>
        <span>Speed: {state.speed.toFixed(2)}</span>
      </div>

      <div style={{ position: "relative" }}>
        <canvas
          ref={canvasRef}
          className="runner-canvas"
          width={PW}
          height={PH}
          onClick={() => dispatch({ type: "jump" } as EndlessRunnerAction)}
        />
        {terminal && (
          <div className="runner-overlay">
            <h2>Game Over</h2>
            <p>Distance: {terminal.score}m</p>
          </div>
        )}
      </div>

      <div className="runner-controls">
        <button
          className="runner-btn"
          onClick={() => dispatch({ type: "jump" } as EndlessRunnerAction)}
        >Jump ↑</button>
        <button
          className="runner-btn"
          onPointerDown={() => dispatch({ type: "duck", on: true } as EndlessRunnerAction)}
          onPointerUp={() => dispatch({ type: "duck", on: false } as EndlessRunnerAction)}
          onPointerLeave={() => dispatch({ type: "duck", on: false } as EndlessRunnerAction)}
        >Duck ↓</button>
      </div>

      <div className="runner-hint">
        Space / Up = jump over green obstacles · Down = duck under purple bars · Speed increases!
      </div>
    </div>
  );
}
