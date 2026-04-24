import { useEffect, useRef, useCallback } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { SkyJoustState, SkyJoustAction } from "./state.js";
import { PLATFORMS, PLAYER_R, ENEMY_R, isTerminal } from "./state.js";
import "./SkyJoust.css";

const PW = 480;
const PH = 500;

export function SkyJoust({
  state,
  dispatch,
}: GameProps<SkyJoustState, Record<never, never>>): JSX.Element {
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
          dispatch({ type: "tick", dt } as SkyJoustAction);
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
      if (k === " " || k === "ArrowUp" || k === "w" || k === "W") {
        e.preventDefault();
        dispatch({ type: "flap" } as SkyJoustAction);
      } else if (k === "ArrowLeft" || k === "a" || k === "A") {
        e.preventDefault();
        dispatch({ type: "move-left" } as SkyJoustAction);
      } else if (k === "ArrowRight" || k === "d" || k === "D") {
        e.preventDefault();
        dispatch({ type: "move-right" } as SkyJoustAction);
      } else if (k === "p" || k === "P") {
        dispatch({ type: state.paused ? "resume" : "pause" } as SkyJoustAction);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [dispatch, state.paused]);

  const terminal = isTerminal(state);
  const { enemies, playerX, playerY, score, lives, wave } = state;

  return (
    <div className="skyjoust-game">
      <div className="skyjoust-header">
        <span>Score: {score}</span>
        <span>Wave: {wave}/3</span>
        <span>Lives: {lives}</span>
      </div>

      <div
        className="skyjoust-playfield"
        style={{ width: PW, height: PH }}
      >
        {/* Platforms */}
        {PLATFORMS.map((p, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              left: (p.x - p.w / 2) * PW,
              top: p.y * PH,
              width: p.w * PW,
              height: 8,
              background: i === 0 ? "#446" : "#558",
              borderRadius: 3,
            }}
          />
        ))}

        {/* Enemies */}
        {enemies.map((e) => {
          if (!e.alive) return null;
          return (
            <div
              key={e.id}
              style={{
                position: "absolute",
                left: e.x * PW - ENEMY_R * PW,
                top: e.y * PH - ENEMY_R * PH,
                width: ENEMY_R * 2 * PW,
                height: ENEMY_R * 2 * PH,
                borderRadius: e.egg ? "3px" : "50%",
                background: e.egg ? "#e94" : "#e44",
                border: e.egg ? "2px solid #a60" : "2px solid #a00",
                boxShadow: e.egg ? "0 0 4px #e94" : "0 0 4px #e44",
              }}
            />
          );
        })}

        {/* Player */}
        <div
          style={{
            position: "absolute",
            left: playerX * PW - PLAYER_R * PW,
            top: playerY * PH - PLAYER_R * PH,
            width: PLAYER_R * 2 * PW,
            height: PLAYER_R * 2 * PH,
            borderRadius: "50%",
            background: "#4af",
            border: "2px solid #069",
            boxShadow: "0 0 6px #4af",
          }}
        />

        {terminal && state.won && (
          <div className="skyjoust-overlay">
            <h2>Victory!</h2>
            <p>Score: {terminal.score}</p>
          </div>
        )}
        {terminal && state.lost && (
          <div className="skyjoust-overlay">
            <h2>Game Over</h2>
            <p>Score: {terminal.score}</p>
          </div>
        )}
        {state.paused && !terminal && (
          <div className="skyjoust-overlay">
            <h2>Paused</h2>
            <p>Press P to resume</p>
          </div>
        )}
      </div>

      <div className="skyjoust-controls">
        <button onClick={() => dispatch({ type: "move-left" } as SkyJoustAction)}>◀</button>
        <button onClick={() => dispatch({ type: "flap" } as SkyJoustAction)}>Flap (Space)</button>
        <button onClick={() => dispatch({ type: "move-right" } as SkyJoustAction)}>▶</button>
      </div>

      <div className="skyjoust-hint">
        Space/W to flap · A/D or ←→ to move · Strike enemies from ABOVE to win!
      </div>
    </div>
  );
}
