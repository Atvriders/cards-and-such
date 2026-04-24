import { useEffect, useRef, useCallback } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { LaserDodgeState, LaserDodgeAction } from "./state.js";
import { isTerminal, PLAYER_R } from "./state.js";
import "./Game.css";

const PW = 440;
const PH = 440;
const LASER_THICKNESS = 5; // px

type Settings = { difficulty: "easy" | "normal" | "hard" };

export function LaserDodge({ state, dispatch }: GameProps<LaserDodgeState, Settings>): JSX.Element {
  const stateRef = useRef(state);
  stateRef.current = state;

  const rafRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);

  const tick = useCallback((now: number) => {
    const s = stateRef.current;
    if (!s.over) {
      if (lastTimeRef.current !== null) {
        const dt = Math.min((now - lastTimeRef.current) / 1000, 0.05);
        dispatch({ type: "tick", dt } as LaserDodgeAction);
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
    dispatch({ type: "setPos", x, y } as LaserDodgeAction);
  }, [dispatch]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const step = 0.02;
      if (e.key === "ArrowUp") { e.preventDefault(); dispatch({ type: "move", dx: 0, dy: -step } as LaserDodgeAction); }
      if (e.key === "ArrowDown") { e.preventDefault(); dispatch({ type: "move", dx: 0, dy: step } as LaserDodgeAction); }
      if (e.key === "ArrowLeft") { e.preventDefault(); dispatch({ type: "move", dx: -step, dy: 0 } as LaserDodgeAction); }
      if (e.key === "ArrowRight") { e.preventDefault(); dispatch({ type: "move", dx: step, dy: 0 } as LaserDodgeAction); }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [dispatch]);

  const terminal = isTerminal(state);
  const playerPxR = PLAYER_R * PW;

  return (
    <div className="ld-game">
      <div className="ld-header">
        <span>Score: {state.score}</span>
        <span>Time: {state.elapsed.toFixed(1)}s</span>
        <span>Lasers: {state.lasers.length}</span>
      </div>

      <div
        className="ld-playfield"
        ref={playfieldRef}
        style={{ width: PW, height: PH }}
        onPointerMove={onPointerMove}
      >
        {/* Lasers */}
        {state.lasers.map((l) => {
          if (l.axis === "h") {
            const segLeft = l.minCoord * PW;
            const segRight = l.maxCoord * PW;
            return (
              <div
                key={l.id}
                className="ld-laser-h"
                style={{
                  top: l.fixedPos * PH,
                  left: segLeft,
                  width: segRight - segLeft,
                  height: LASER_THICKNESS,
                  background: l.color,
                  color: l.color,
                }}
              />
            );
          } else {
            const segTop = l.minCoord * PH;
            const segBottom = l.maxCoord * PH;
            return (
              <div
                key={l.id}
                className="ld-laser-v"
                style={{
                  left: l.fixedPos * PW,
                  top: segTop,
                  height: segBottom - segTop,
                  width: LASER_THICKNESS,
                  background: l.color,
                  color: l.color,
                }}
              />
            );
          }
        })}

        {/* Player */}
        <div
          className="ld-player"
          style={{
            left: state.playerX * PW,
            top: state.playerY * PH,
            width: playerPxR * 2,
            height: playerPxR * 2,
          }}
        />

        {terminal && (
          <div className="ld-overlay">
            <h2>Zapped!</h2>
            <p>Score: {terminal.score}</p>
            <p>Survived: {state.elapsed.toFixed(1)}s</p>
          </div>
        )}
      </div>

      <div className="ld-hint">Move mouse or Arrow Keys · Dodge the moving laser beams!</div>
    </div>
  );
}
