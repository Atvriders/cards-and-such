import { useEffect, useCallback, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { PixelRunnerState, PixelRunnerAction, PixelRunnerSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./PixelRunner.css";

const TICK_MS = { normal: 100, fast: 70, turbo: 45 };
const CANVAS_W = 480;
const CANVAS_H = 160;
const GROUND_H = 20;
const CELL = 24; // px per unit
const PLAYER_X_PX = 3 * CELL;
const PLAYER_W = 20;
const PLAYER_H = 24;

export function PixelRunner({
  state,
  dispatch,
}: GameProps<PixelRunnerState, PixelRunnerSettings>): JSX.Element {
  const stateRef = useRef(state);
  stateRef.current = state;

  const tick = useCallback(() => {
    dispatch({ type: "tick" } as PixelRunnerAction);
  }, [dispatch]);

  useEffect(() => {
    if (!state.alive) return;
    const ms = TICK_MS[state.settings.speed] ?? 100;
    const id = setInterval(tick, ms);
    return () => clearInterval(id);
  }, [state.alive, state.settings.speed, tick]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === " " || e.key === "ArrowUp" || e.key === "w" || e.key === "W") {
        e.preventDefault();
        dispatch({ type: "jump" } as PixelRunnerAction);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [dispatch]);

  const terminal = isTerminal(state);

  const playerBottomPx = GROUND_H + state.playerY * CELL * 0.5;

  return (
    <div className="pixelrunner-game">
      <div className="pixelrunner-header">
        <span>Score: {state.score}</span>
        <span>Distance: {state.distance}m</span>
      </div>

      <div
        className="pixelrunner-canvas"
        style={{ width: CANVAS_W, height: CANVAS_H }}
      >
        <div className="pixelrunner-ground" />

        {/* Player */}
        <div
          className="pixelrunner-player"
          style={{
            left: PLAYER_X_PX,
            bottom: playerBottomPx,
            width: PLAYER_W,
            height: PLAYER_H,
          }}
        />

        {/* Obstacles */}
        {state.obstacles.map((o, i) => {
          const obH = o.height === 2 ? 48 : 24;
          return (
            <div
              key={i}
              className="pixelrunner-obstacle"
              style={{
                left: o.x * CELL,
                width: 18,
                height: obH,
              }}
            />
          );
        })}
      </div>

      {terminal ? (
        <div className="pixelrunner-overlay">
          <h2>Game Over!</h2>
          <p>Score: {terminal.score} · Distance: {state.distance}m</p>
        </div>
      ) : (
        <>
          <div className="pixelrunner-controls">
            <button data-testid="hint-target-pixel-runner-action" onClick={() => dispatch({ type: "jump" } as PixelRunnerAction)}>
              Jump
            </button>
          </div>
          <div className="pixelrunner-hint">Space / Up Arrow / Tap Jump to leap over obstacles</div>
        </>
      )}
    </div>
  );
}
