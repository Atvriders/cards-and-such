import { useEffect, useRef, useCallback } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { ClimbJumperState, ClimbJumperAction, ClimbJumperSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./ClimbJumper.css";

const PW = 360;
const PH = 540;
const SCREEN_H_WORLD = 1.0; // same as state constant

// Convert world Y to screen Y (screen Y 0 = top, PH = bottom)
function worldToScreenY(worldY: number, cameraY: number): number {
  // worldY increases upward, screen Y increases downward
  return PH - (worldY - cameraY) * PH / SCREEN_H_WORLD;
}

export function ClimbJumper({
  state,
  dispatch,
  onGameOver,
}: GameProps<ClimbJumperState, ClimbJumperSettings>): JSX.Element {
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
      if (s.over) {
        rafRef.current = null;
        lastTimeRef.current = null;
        return;
      }
      if (lastTimeRef.current !== null) {
        const dt = Math.min((now - lastTimeRef.current) / 1000, 0.05);
        dispatch({ type: "tick", dt } as ClimbJumperAction);
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

  // Keyboard
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") {
        e.preventDefault();
        dispatch({ type: "moveLeft", on: true } as ClimbJumperAction);
      } else if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") {
        e.preventDefault();
        dispatch({ type: "moveRight", on: true } as ClimbJumperAction);
      }
    }
    function onKeyUp(e: KeyboardEvent) {
      if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") {
        dispatch({ type: "moveLeft", on: false } as ClimbJumperAction);
      } else if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") {
        dispatch({ type: "moveRight", on: false } as ClimbJumperAction);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, [dispatch]);

  // Draw
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, PW, PH);

    const { platforms, playerX, playerY, cameraY } = state;
    const PLAYER_HALF_W = 0.04;
    const PLAYER_H = 0.07;

    // Platforms
    platforms.forEach((plat) => {
      const sy = worldToScreenY(plat.y, cameraY);
      ctx.fillStyle = "#44aa66";
      ctx.fillRect(plat.x * PW, sy, plat.width * PW, 8);
      ctx.fillStyle = "#66cc88";
      ctx.fillRect(plat.x * PW, sy, plat.width * PW, 3);
    });

    // Player
    const psx = playerX * PW;
    const psy = worldToScreenY(playerY, cameraY);
    ctx.fillStyle = "#ffaa22";
    ctx.fillRect(
      psx - PLAYER_HALF_W * PW,
      psy - PLAYER_H * PH / SCREEN_H_WORLD,
      PLAYER_HALF_W * 2 * PW,
      PLAYER_H * PH / SCREEN_H_WORLD,
    );
    // Face dot
    ctx.fillStyle = "#000";
    ctx.beginPath();
    ctx.arc(psx, psy - PLAYER_H * PH / SCREEN_H_WORLD * 0.6, 3, 0, Math.PI * 2);
    ctx.fill();
  });

  const terminal = isTerminal(state);

  const onLeftDown = useCallback(() => dispatch({ type: "moveLeft", on: true } as ClimbJumperAction), [dispatch]);
  const onLeftUp = useCallback(() => dispatch({ type: "moveLeft", on: false } as ClimbJumperAction), [dispatch]);
  const onRightDown = useCallback(() => dispatch({ type: "moveRight", on: true } as ClimbJumperAction), [dispatch]);
  const onRightUp = useCallback(() => dispatch({ type: "moveRight", on: false } as ClimbJumperAction), [dispatch]);

  return (
    <div className="climb-game">
      <div className="climb-header">
        <span>Height: {state.score}</span>
      </div>

      <div style={{ position: "relative" }}>
        <canvas ref={canvasRef} className="climb-canvas" width={PW} height={PH} />
        {terminal && (
          <div className="climb-overlay">
            <h2>Game Over</h2>
            <p>Height Reached: {terminal.score}</p>
          </div>
        )}
      </div>

      <div className="climb-controls">
        <button
          className="climb-btn"
          onPointerDown={onLeftDown}
          onPointerUp={onLeftUp}
          onPointerLeave={onLeftUp}
        >
          ◀ Left
        </button>
        <button
          className="climb-btn"
          onPointerDown={onRightDown}
          onPointerUp={onRightUp}
          onPointerLeave={onRightUp}
        >
          Right ▶
        </button>
      </div>

      <div className="climb-hint">Arrow keys / A-D or buttons · Land on platforms to auto-jump · Don't fall!</div>
    </div>
  );
}
