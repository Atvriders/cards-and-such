import { useEffect, useRef, useCallback } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { BarrelJumperState, BarrelJumperAction } from "./state.js";
import { PLATFORMS, PLAYER_W, PLAYER_H, BARREL_RADIUS, GOAL_X, GOAL_Y, isTerminal } from "./state.js";
import "./BarrelJumper.css";

const PW = 480;
const PH = 560;

export function BarrelJumper({
  state,
  dispatch,
}: GameProps<BarrelJumperState, Record<never, never>>): JSX.Element {
  const stateRef = useRef(state);
  stateRef.current = state;

  const rafRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);

  const tick = useCallback(
    (now: number) => {
      const s = stateRef.current;
      if (!s.lost && !s.won) {
        if (lastTimeRef.current !== null) {
          const dt = Math.min((now - lastTimeRef.current) / 1000, 0.05);
          dispatch({ type: "tick", dt } as BarrelJumperAction);
        }
        lastTimeRef.current = now;
        rafRef.current = requestAnimationFrame(tick);
      }
    },
    [dispatch],
  );

  useEffect(() => {
    if (!state.lost && !state.won) {
      rafRef.current = requestAnimationFrame(tick);
    }
    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
        lastTimeRef.current = null;
      }
    };
  }, [state.lost, state.won, tick]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const k = e.key;
      if (k === "ArrowLeft" || k === "a" || k === "A") {
        e.preventDefault();
        dispatch({ type: "move-left" } as BarrelJumperAction);
      } else if (k === "ArrowRight" || k === "d" || k === "D") {
        e.preventDefault();
        dispatch({ type: "move-right" } as BarrelJumperAction);
      } else if (k === " " || k === "ArrowUp" || k === "w" || k === "W") {
        e.preventDefault();
        dispatch({ type: "jump" } as BarrelJumperAction);
      } else if (k === "ArrowUp" || k === "c" || k === "C") {
        e.preventDefault();
        dispatch({ type: "climb" } as BarrelJumperAction);
      } else if (k === "f" || k === "F") {
        dispatch({ type: "climb" } as BarrelJumperAction);
      } else if (k === "p" || k === "P") {
        dispatch({ type: state.paused ? "resume" : "pause" } as BarrelJumperAction);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [dispatch, state.paused]);

  const terminal = isTerminal(state);
  const { barrels, playerX, playerY, score, lives } = state;

  return (
    <div className="barreljumper-game">
      <div className="barreljumper-header">
        <span>Score: {score}</span>
        <span>Lives: {lives}</span>
      </div>

      <div
        className="barreljumper-playfield"
        style={{ width: PW, height: PH }}
      >
        {/* Platforms */}
        {PLATFORMS.map((p, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              left: p.xLeft * PW,
              top: p.y * PH,
              width: (p.xRight - p.xLeft) * PW,
              height: 8,
              background: "#8B6914",
              borderRadius: 2,
            }}
          />
        ))}

        {/* Ladders */}
        {PLATFORMS.filter((p) => p.ladderX !== null).map((p, i) => {
          const nextPlat = PLATFORMS[PLATFORMS.indexOf(p) + 1];
          if (!nextPlat) return null;
          return (
            <div
              key={`ladder-${i}`}
              style={{
                position: "absolute",
                left: p.ladderX! * PW - 8,
                top: nextPlat.y * PH,
                width: 16,
                height: (p.y - nextPlat.y) * PH,
                background: "repeating-linear-gradient(to bottom, #888 0px, #888 4px, transparent 4px, transparent 16px)",
                borderLeft: "2px solid #888",
                borderRight: "2px solid #888",
              }}
            />
          );
        })}

        {/* Goal star */}
        <div
          style={{
            position: "absolute",
            left: GOAL_X * PW - 14,
            top: GOAL_Y * PH - 14,
            width: 28,
            height: 28,
            background: "#ff0",
            borderRadius: "50%",
            boxShadow: "0 0 10px #ff0",
          }}
        />

        {/* Barrels */}
        {barrels.map((b) => (
          <div
            key={b.id}
            style={{
              position: "absolute",
              left: b.x * PW - BARREL_RADIUS * PW,
              top: b.y * PH - BARREL_RADIUS * PH,
              width: BARREL_RADIUS * 2 * PW,
              height: BARREL_RADIUS * 2 * PH,
              background: "#8B3A00",
              borderRadius: "50%",
              border: "2px solid #5a2000",
            }}
          />
        ))}

        {/* Player */}
        <div
          style={{
            position: "absolute",
            left: playerX * PW - PLAYER_W / 2 * PW,
            top: playerY * PH,
            width: PLAYER_W * PW,
            height: PLAYER_H * PH,
            background: "#4af",
            borderRadius: "4px 4px 0 0",
            boxShadow: "0 0 4px #4af",
          }}
        />

        {terminal && state.won && (
          <div className="barreljumper-overlay">
            <h2>You Made It!</h2>
            <p>Score: {terminal.score}</p>
          </div>
        )}
        {terminal && state.lost && (
          <div className="barreljumper-overlay">
            <h2>Game Over</h2>
            <p>Score: {terminal.score}</p>
          </div>
        )}
        {state.paused && !terminal && (
          <div className="barreljumper-overlay">
            <h2>Paused</h2>
            <p>Press P to resume</p>
          </div>
        )}
      </div>

      <div className="barreljumper-controls">
        <button onClick={() => dispatch({ type: "move-left" } as BarrelJumperAction)}>◀</button>
        <button onClick={() => dispatch({ type: "jump" } as BarrelJumperAction)}>Jump</button>
        <button onClick={() => dispatch({ type: "move-right" } as BarrelJumperAction)}>▶</button>
        <button onClick={() => dispatch({ type: "climb" } as BarrelJumperAction)}>Climb (F)</button>
      </div>

      <div className="barreljumper-hint">
        A/D or ←→ to move · Space/W to jump · F to climb ladder · Reach the ★
      </div>
    </div>
  );
}
