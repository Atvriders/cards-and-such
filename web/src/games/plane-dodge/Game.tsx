import { useEffect, useRef, useCallback } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { PlaneDodgeState, PlaneDodgeAction } from "./state.js";
import { isTerminal, PLANE_W, PLANE_H } from "./state.js";
import "./Game.css";

const PW = 480;
const PH = 400;

type Settings = { difficulty: "easy" | "normal" | "hard" };

export function PlaneDodge({ state, dispatch, onGameOver }: GameProps<PlaneDodgeState, Settings>): JSX.Element {
  const stateRef = useRef(state);
  stateRef.current = state;

  const rafRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);
  const endedRef = useRef(false);

  const tick = useCallback((now: number) => {
    const s = stateRef.current;
    if (!s.over) {
      if (lastTimeRef.current !== null) {
        const dt = Math.min((now - lastTimeRef.current) / 1000, 0.05);
        dispatch({ type: "tick", dt } as PlaneDodgeAction);
      }
      lastTimeRef.current = now;
      rafRef.current = requestAnimationFrame(tick);
    }
  }, [dispatch]);

  useEffect(() => {
    if (!state.over) {
      rafRef.current = requestAnimationFrame(tick);
    }
    return () => {
      if (rafRef.current !== null) { cancelAnimationFrame(rafRef.current); rafRef.current = null; lastTimeRef.current = null; }
    };
  }, [state.over, tick]);

  const playfieldRef = useRef<HTMLDivElement>(null);

  const onPointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    const rect = playfieldRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    dispatch({ type: "move", x, y } as PlaneDodgeAction);
  }, [dispatch]);

  // Arrow key support
  useEffect(() => {
    const speed = 0.015;
    function onKey(e: KeyboardEvent) {
      const s = stateRef.current;
      let x = s.planeX + PLANE_W / 2;
      let y = s.planeY + PLANE_H / 2;
      if (e.key === "ArrowUp") { y -= speed * 8; e.preventDefault(); }
      if (e.key === "ArrowDown") { y += speed * 8; e.preventDefault(); }
      if (e.key === "ArrowLeft") { x -= speed * 8; e.preventDefault(); }
      if (e.key === "ArrowRight") { x += speed * 8; e.preventDefault(); }
      dispatch({ type: "move", x, y } as PlaneDodgeAction);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [dispatch]);

  const terminal = isTerminal(state);

  useEffect(() => {
    if (terminal && !endedRef.current) {
      endedRef.current = true;
      onGameOver(terminal.score);
    }
  }, [terminal, onGameOver]);

  const { planeX, planeY, obstacles, score } = state;

  return (
    <div className="pd-game">
      <div className="pd-header">
        <span>Score: {score}</span>
        <span>Distance: {Math.floor(state.distance * 100)}m</span>
      </div>

      <div
        className="pd-playfield"
        ref={playfieldRef}
        style={{ width: PW, height: PH }}
        onPointerMove={onPointerMove}
      >
        {/* Obstacles */}
        {obstacles.map((o) => (
          <div
            key={o.id}
            className="pd-obstacle"
            style={{ left: o.x * PW, top: o.y * PH, width: o.w * PW, height: o.h * PH }}
          />
        ))}

        {/* Plane */}
        <div
          className="pd-plane"
          style={{ left: planeX * PW, top: planeY * PH, width: PLANE_W * PW, height: PLANE_H * PH }}
        >
          ✈
        </div>

        {terminal && (
          <div className="pd-overlay">
            <h2>Crashed!</h2>
            <p>Score: {terminal.score}</p>
            <p>Distance: {Math.floor(state.distance * 100)}m</p>
          </div>
        )}
      </div>

      <div className="pd-hint">Move mouse or use Arrow Keys to guide the plane · Avoid red obstacles!</div>
    </div>
  );
}
