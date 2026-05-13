import { useEffect, useRef, useCallback } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { SkyDefenderState, SkyDefenderAction } from "./state.js";
import { SHIP_W, SHIP_H, ALIEN_W, ALIEN_H, HUMAN_W, HUMAN_H, GROUND_Y, isTerminal } from "./state.js";
import "./SkyDefender.css";

const PW = 480;
const PH = 400;

export function SkyDefender({
  state,
  dispatch,
  onGameOver,
}: GameProps<SkyDefenderState, Record<never, never>>): JSX.Element {
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
  const keysRef = useRef<Set<string>>(new Set());

  const tick = useCallback(
    (now: number) => {
      const s = stateRef.current;
      if (!s.lost && !s.won) {
        if (lastTimeRef.current !== null) {
          const dt = Math.min((now - lastTimeRef.current) / 1000, 0.05);
          // Continuous movement
          const keys = keysRef.current;
          let dx = 0, dy = 0;
          if (keys.has("ArrowLeft") || keys.has("a") || keys.has("A")) dx -= 0.35 * dt;
          if (keys.has("ArrowRight") || keys.has("d") || keys.has("D")) dx += 0.35 * dt;
          if (keys.has("ArrowUp") || keys.has("w") || keys.has("W")) dy -= 0.3 * dt;
          if (keys.has("ArrowDown") || keys.has("s") || keys.has("S")) dy += 0.3 * dt;
          if (dx !== 0 || dy !== 0) dispatch({ type: "move", dx, dy } as SkyDefenderAction);
          dispatch({ type: "tick", dt } as SkyDefenderAction);
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
    function onKeyDown(e: KeyboardEvent) {
      keysRef.current.add(e.key);
      if (e.key === " " || e.key === "Spacebar") {
        e.preventDefault();
        dispatch({ type: "fire" } as SkyDefenderAction);
      } else if (e.key === "p" || e.key === "P") {
        dispatch({ type: stateRef.current.paused ? "resume" : "pause" } as SkyDefenderAction);
      }
    }
    function onKeyUp(e: KeyboardEvent) { keysRef.current.delete(e.key); }
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, [dispatch]);

  const terminal = isTerminal(state);
  const { humans, aliens, bullets, shipX, shipY, cameraX, score, lives, wave } = state;

  // Convert world x to screen x
  const wx = (worldX: number) => (worldX - cameraX) * PW;

  return (
    <div className="skydefender-game">
      <div className="skydefender-header">
        <span>Score: {score}</span>
        <span>Wave: {wave}/3</span>
        <span>Lives: {lives}</span>
        <span>Humans: {humans.filter((h) => h.alive).length}/10</span>
      </div>

      <div className="skydefender-playfield" style={{ width: PW, height: PH }}>
        {/* Ground */}
        <div style={{ position: "absolute", left: 0, top: GROUND_Y * PH, width: PW, height: 8, background: "#3a5" }} />

        {/* Humans */}
        {humans.map((h) => {
          if (!h.alive) return null;
          const screenX = wx(h.x);
          if (screenX < -20 || screenX > PW + 20) return null;
          return (
            <div
              key={h.id}
              style={{
                position: "absolute",
                left: screenX - HUMAN_W / 2 * PW,
                top: h.y * PH,
                width: HUMAN_W * PW,
                height: HUMAN_H * PH,
                background: h.carried ? "#f94" : "#4f4",
                borderRadius: "4px 4px 0 0",
              }}
            />
          );
        })}

        {/* Aliens */}
        {aliens.map((a) => {
          if (!a.alive) return null;
          const screenX = wx(a.x);
          if (screenX < -20 || screenX > PW + 20) return null;
          return (
            <div
              key={a.id}
              style={{
                position: "absolute",
                left: screenX - ALIEN_W / 2 * PW,
                top: a.y * PH,
                width: ALIEN_W * PW,
                height: ALIEN_H * PH,
                background: a.abducting ? "#e44" : "#e96",
                borderRadius: "50%",
                boxShadow: "0 0 5px #e96",
              }}
            />
          );
        })}

        {/* Bullets */}
        {bullets.map((b) => {
          const screenX = wx(b.x);
          if (screenX < -5 || screenX > PW + 5) return null;
          return (
            <div
              key={b.id}
              style={{
                position: "absolute",
                left: screenX,
                top: b.y * PH - 2,
                width: 12,
                height: 4,
                background: "#ff0",
                borderRadius: 2,
              }}
            />
          );
        })}

        {/* Ship */}
        <div
          style={{
            position: "absolute",
            left: wx(shipX) - SHIP_W / 2 * PW,
            top: shipY * PH,
            width: SHIP_W * PW,
            height: SHIP_H * PH,
            background: "#4af",
            borderRadius: "2px",
            transform: state.shipFacing === -1 ? "scaleX(-1)" : undefined,
            boxShadow: "0 0 6px #4af",
          }}
        />

        {terminal && state.won && (
          <div className="skydefender-overlay">
            <h2>Sector Clear!</h2>
            <p>Score: {terminal.score}</p>
          </div>
        )}
        {terminal && state.lost && (
          <div className="skydefender-overlay">
            <h2>Mission Failed</h2>
            <p>Score: {terminal.score}</p>
          </div>
        )}
        {state.paused && !terminal && (
          <div className="skydefender-overlay">
            <h2>Paused</h2>
            <p>Press P to resume</p>
          </div>
        )}
      </div>

      <div className="skydefender-controls">
        <button data-testid="hint-target-defender-like-action" onClick={() => dispatch({ type: "fire" } as SkyDefenderAction)}>Fire (Space)</button>
      </div>

      <div className="skydefender-hint">
        WASD/Arrow keys to fly · Space to fire · Protect the humans from alien abductors!
      </div>
    </div>
  );
}
