import { useEffect, useRef, useCallback } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { GalaxyFormationState, GalaxyFormationAction } from "./state.js";
import { PLAYER_Y, PLAYER_WIDTH, PLAYER_HEIGHT, ENEMY_W, ENEMY_H, BULLET_RADIUS, isTerminal } from "./state.js";
import "./GalaxyFormation.css";

const PW = 480;
const PH = 600;

export function GalaxyFormation({
  state,
  dispatch,
}: GameProps<GalaxyFormationState, Record<never, never>>): JSX.Element {
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
          dispatch({ type: "tick", dt } as GalaxyFormationAction);
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
      const s = stateRef.current;
      if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") {
        e.preventDefault();
        dispatch({ type: "move", x: s.playerX - 0.05 } as GalaxyFormationAction);
      } else if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") {
        e.preventDefault();
        dispatch({ type: "move", x: s.playerX + 0.05 } as GalaxyFormationAction);
      } else if (e.key === " " || e.key === "Spacebar") {
        e.preventDefault();
        if (!s.paused) dispatch({ type: "fire" } as GalaxyFormationAction);
      } else if (e.key === "p" || e.key === "P") {
        dispatch({ type: s.paused ? "resume" : "pause" } as GalaxyFormationAction);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [dispatch]);

  const playfieldRef = useRef<HTMLDivElement | null>(null);
  const onPointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const rect = playfieldRef.current?.getBoundingClientRect();
      if (!rect) return;
      const x = (e.clientX - rect.left) / rect.width;
      dispatch({ type: "move", x } as GalaxyFormationAction);
    },
    [dispatch],
  );
  const onPointerClick = useCallback(() => {
    if (!stateRef.current.paused) dispatch({ type: "fire" } as GalaxyFormationAction);
  }, [dispatch]);

  const terminal = isTerminal(state);
  const { enemies, bullets, playerX, lives, score, wave, playerInvincible } = state;

  const enemyColors = ["#f44", "#fa4", "#ff4", "#4f4"];

  return (
    <div className="galaxy-game">
      <div className="galaxy-header">
        <span>Score: {score}</span>
        <span>Wave: {wave}/3</span>
        <span>Lives: {lives}</span>
      </div>

      <div
        className="galaxy-playfield"
        ref={playfieldRef}
        style={{ width: PW, height: PH }}
        onPointerMove={onPointerMove}
        onClick={onPointerClick}
      >
        {/* Stars background dots */}
        {[...Array(20)].map((_, i) => (
          <div
            key={`star-${i}`}
            style={{
              position: "absolute",
              width: 2,
              height: 2,
              borderRadius: "50%",
              background: "#fff",
              left: ((i * 137 + 17) % 100) * PW / 100,
              top: ((i * 97 + 43) % 100) * PH / 100,
              opacity: 0.4,
            }}
          />
        ))}

        {/* Enemies */}
        {enemies.map((e) => {
          if (!e.alive) return null;
          return (
            <div
              key={e.id}
              className="galaxy-enemy"
              style={{
                left: e.x * PW,
                top: e.y * PH,
                width: ENEMY_W * PW,
                height: ENEMY_H * PH,
                background: enemyColors[e.row % enemyColors.length],
                borderRadius: e.diving ? "50%" : "4px",
                boxShadow: `0 0 6px ${enemyColors[e.row % enemyColors.length]}`,
              }}
            />
          );
        })}

        {/* Bullets */}
        {bullets.map((b) => (
          <div
            key={b.id}
            className="galaxy-bullet"
            style={{
              left: b.x * PW,
              top: b.y * PH,
              width: BULLET_RADIUS * 2 * PW,
              height: BULLET_RADIUS * 2 * PH,
              background: b.isEnemy ? "#f66" : "#fff",
              boxShadow: b.isEnemy ? "0 0 4px #f66" : "0 0 4px #fff",
            }}
          />
        ))}

        {/* Player */}
        <div
          className="galaxy-player"
          style={{
            left: playerX * PW,
            top: (PLAYER_Y - PLAYER_HEIGHT / 2) * PH,
            borderLeftWidth: PLAYER_WIDTH * PW / 2,
            borderRightWidth: PLAYER_WIDTH * PW / 2,
            borderBottomWidth: PLAYER_HEIGHT * PH,
            opacity: playerInvincible > 0 ? 0.4 : 1,
          }}
        />

        {/* Overlays */}
        {terminal && state.won && (
          <div className="galaxy-overlay">
            <h2>Victory!</h2>
            <p>Score: {terminal.score}</p>
          </div>
        )}
        {terminal && state.lost && (
          <div className="galaxy-overlay">
            <h2>Game Over</h2>
            <p>Score: {terminal.score}</p>
          </div>
        )}
        {state.paused && !terminal && (
          <div className="galaxy-overlay">
            <h2>Paused</h2>
            <p>Press P to resume</p>
          </div>
        )}
      </div>

      <div className="galaxy-controls">
        {!terminal && (
          <button onClick={() => dispatch({ type: state.paused ? "resume" : "pause" } as GalaxyFormationAction)}>
            {state.paused ? "Resume" : "Pause"}
          </button>
        )}
      </div>

      <div className="galaxy-hint">
        Arrow/A-D to move · Space/Click to fire · P to pause
      </div>
    </div>
  );
}
