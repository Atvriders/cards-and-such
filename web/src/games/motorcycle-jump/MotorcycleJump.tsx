import { useEffect, useCallback } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { MotoState, MotoAction, MotoSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./MotorcycleJump.css";

const TICK_MS = 40;
const FIELD_W = 400;
const FIELD_H = 240;
const GROUND_H = 20;
const CAMERA_OFFSET = 80; // bike appears at this x on screen

export function MotorcycleJump({
  state,
  dispatch,
}: GameProps<MotoState, MotoSettings>): JSX.Element {
  const tick = useCallback(() => {
    dispatch({ type: "tick" } as MotoAction);
  }, [dispatch]);

  useEffect(() => {
    if (state.over) return;
    const id = setInterval(tick, TICK_MS);
    return () => clearInterval(id);
  }, [state.over, tick]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === " " || e.key === "ArrowUp" || e.key === "w") {
        e.preventDefault();
        dispatch({ type: "jump" } as MotoAction);
      }
      if (e.key === "ArrowRight" || e.key === "d") {
        e.preventDefault();
        dispatch({ type: "throttle" } as MotoAction);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [dispatch]);

  const terminal = isTerminal(state);

  // Camera: world scrolls so bike appears at CAMERA_OFFSET
  const cameraX = state.bikeX - CAMERA_OFFSET;

  const bikeScreenX = CAMERA_OFFSET;
  const bikeScreenY = FIELD_H - GROUND_H - state.bikeY - 30;

  const clearedCount = state.ramps.filter((r) => r.cleared).length;

  return (
    <div className="moto-game">
      <div className="moto-header">
        <span>Cleared: {clearedCount}/{state.ramps.length}</span>
        <span>{"❤️".repeat(state.lives)}</span>
        <span>Score: {state.score}</span>
        <span>Speed: {state.speed.toFixed(1)}</span>
      </div>

      <div className="moto-field" style={{ width: FIELD_W, height: FIELD_H }}>
        <div className="moto-ground" />

        {/* Ramps */}
        {state.ramps.map((r, i) => {
          const screenX = r.x - cameraX;
          if (screenX + r.width < 0 || screenX > FIELD_W) return null;
          return (
            <div
              key={i}
              className={`moto-ramp${r.cleared ? " moto-ramp--cleared" : ""}`}
              style={{
                left: screenX,
                width: r.width,
                height: r.height,
                bottom: GROUND_H,
              }}
            />
          );
        })}

        {/* Bike */}
        <div
          className="moto-bike"
          style={{ left: bikeScreenX, top: bikeScreenY }}
        >
          🏍️
        </div>

        {terminal && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "rgba(0,0,0,0.65)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              gap: 12,
            }}
          >
            <div className="moto-overlay">
              <h2>{clearedCount === state.ramps.length ? "All Clear!" : "Wiped Out!"}</h2>
              <p>Score: {terminal.score}</p>
            </div>
          </div>
        )}
      </div>

      {!terminal && (
        <>
          <div className="moto-controls">
            <button onClick={() => dispatch({ type: "jump" } as MotoAction)}>Jump</button>
            <button onClick={() => dispatch({ type: "throttle" } as MotoAction)}>Throttle</button>
          </div>
          <div className="moto-hint">Space/Up to jump · Right/D to throttle · Clear all ramps!</div>
        </>
      )}
    </div>
  );
}
