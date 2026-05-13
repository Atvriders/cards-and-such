import { useEffect, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { SpaceInvadersState, SpaceInvadersAction, SpaceInvadersSettings } from "./state.js";
import { isTerminal, ALIEN_COLS, ALIEN_ROWS, PLAYER_Y, PLAYER_HALF, alienX, alienY, ALIEN_RADIUS } from "./state.js";
import "./SpaceInvaders.css";

const PW = 520;
const PH = 520;
const TICK_MS = 16; // ~60fps

// Alien shapes per row
const ALIEN_CHARS = ["👾", "🛸", "🛸", "🤖", "🤖"];

export function SpaceInvaders({
  state,
  dispatch,
  onGameOver,
}: GameProps<SpaceInvadersState, SpaceInvadersSettings>): JSX.Element {
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

  // ── Tick interval ─────────────────────────────────────────────────────────
  useEffect(() => {
    const id = setInterval(() => {
      if (!stateRef.current.over) {
        dispatch({ type: "tick" } as SpaceInvadersAction);
      }
    }, TICK_MS);
    return () => clearInterval(id);
  }, [dispatch]);

  // ── Keyboard ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const keys = new Set<string>();

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") {
        e.preventDefault();
        keys.add("left");
      }
      if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") {
        e.preventDefault();
        keys.add("right");
      }
      if (e.key === " " || e.key === "Spacebar") {
        e.preventDefault();
        dispatch({ type: "fire" } as SpaceInvadersAction);
      }
    }
    function onKeyUp(e: KeyboardEvent) {
      if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") keys.delete("left");
      if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") keys.delete("right");
    }

    let frameId: number;
    function keyLoop() {
      if (keys.has("left")) dispatch({ type: "move", dir: -1 } as SpaceInvadersAction);
      if (keys.has("right")) dispatch({ type: "move", dir: 1 } as SpaceInvadersAction);
      frameId = requestAnimationFrame(keyLoop);
    }
    frameId = requestAnimationFrame(keyLoop);

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, [dispatch]);

  const terminal = isTerminal(state);
  const { aliens, formationX, formationY, playerX, bullets, lives } = state;
  const maxLives = 3;

  const playerWidthPx = PLAYER_HALF * 2 * PW;

  return (
    <div className="sinv-game">
      <div className="sinv-header">
        <span>Score: {state.score}</span>
        <div className="sinv-lives">
          {Array.from({ length: maxLives }, (_, i) => (
            <span
              key={i}
              className={`sinv-life${i >= lives ? " sinv-life--lost" : ""}`}
            />
          ))}
        </div>
        <span>Level: {state.level}</span>
      </div>

      <div className="sinv-canvas-wrapper" style={{ width: PW, height: PH }}>
        {/* Aliens */}
        {Array.from({ length: ALIEN_ROWS }, (_, r) =>
          Array.from({ length: ALIEN_COLS }, (_, c) => {
            if (!aliens[r]![c]) return null;
            const ax = alienX(c, formationX) * PW;
            const ay = alienY(r, formationY) * PH;
            const emoji = ALIEN_CHARS[r] ?? "👾";
            return (
              <div
                key={`${r},${c}`}
                style={{
                  position: "absolute",
                  left: ax - ALIEN_RADIUS * PW,
                  top: ay - ALIEN_RADIUS * PH,
                  width: ALIEN_RADIUS * 2 * PW,
                  height: ALIEN_RADIUS * 2 * PH,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: ALIEN_RADIUS * PW * 1.4,
                  lineHeight: 1,
                  background: "#000",
                }}
              >
                {emoji}
              </div>
            );
          })
        )}

        {/* Player ship */}
        <div
          style={{
            position: "absolute",
            left: playerX * PW - playerWidthPx / 2,
            top: PLAYER_Y * PH - 18,
            width: playerWidthPx,
            height: 18,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 22,
          }}
        >
          🚀
        </div>

        {/* Bullets */}
        {bullets.map((b) => (
          <div
            key={b.id}
            style={{
              position: "absolute",
              left: b.x * PW - 2,
              top: b.y * PH - 6,
              width: 4,
              height: 12,
              background: b.vy < 0 ? "#0f0" : "#f60",
              borderRadius: 2,
            }}
          />
        ))}

        {/* Background */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "#000",
            zIndex: -1,
            border: "2px solid #333",
          }}
        />

        {terminal && (
          <div className="sinv-overlay">
            <h2>Game Over</h2>
            <p>Score: {terminal.score}</p>
            <p>Level: {state.level}</p>
          </div>
        )}
      </div>

      <div className="sinv-hint">
        ← → Move · Space Fire
      </div>
    </div>
  );
}
