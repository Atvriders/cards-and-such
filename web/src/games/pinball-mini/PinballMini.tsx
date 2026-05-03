import { useEffect, useCallback, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { PinballState, PinballAction, PinballSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./PinballMini.css";

const TICK_MS = 16;

export function PinballMini({
  state,
  dispatch,
}: GameProps<PinballState, PinballSettings>): JSX.Element {
  const stateRef = useRef(state);
  stateRef.current = state;

  const tick = useCallback(() => {
    dispatch({ type: "tick" } as PinballAction);
  }, [dispatch]);

  useEffect(() => {
    if (state.over) return;
    const id = setInterval(tick, TICK_MS);
    return () => clearInterval(id);
  }, [state.over, tick]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const s = stateRef.current;
      if (s.over) return;
      if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") {
        e.preventDefault();
        dispatch({ type: "paddleLeft" } as PinballAction);
      } else if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") {
        e.preventDefault();
        dispatch({ type: "paddleRight" } as PinballAction);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [dispatch]);

  const terminal = isTerminal(state);
  const paddleTopPx = state.fieldH - state.paddleH - 10;

  // Track last bumper hit times for flash effect
  const bumperHitMax = Math.max(0, ...state.bumpers.map((b) => b.hits));

  return (
    <div className="pinball-game">
      <div className="pinball-header">
        <span>Score: {state.score}</span>
        <span>{"❤️".repeat(state.lives)}</span>
      </div>

      <div
        className="pinball-field"
        style={{ width: state.fieldW, height: state.fieldH }}
        onMouseMove={(e) => {
          if (state.over) return;
          const rect = e.currentTarget.getBoundingClientRect();
          const mx = e.clientX - rect.left;
          dispatch({ type: "movePaddle", x: mx - state.paddleW / 2 } as PinballAction);
        }}
      >
        {/* Ball */}
        <div
          className="pinball-ball"
          style={{
            left: state.ballX,
            top: state.ballY,
            width: state.ballRadius * 2,
            height: state.ballRadius * 2,
          }}
        />

        {/* Bumpers */}
        {state.bumpers.map((b, i) => (
          <div
            key={i}
            className={`pinball-bumper ${b.hits > 0 ? "pinball-bumper--hit" : "pinball-bumper--idle"}`}
            style={{
              left: b.x,
              top: b.y,
              width: b.radius * 2,
              height: b.radius * 2,
            }}
          >
            {b.hits}
          </div>
        ))}

        {/* Paddle */}
        <div
          className="pinball-paddle"
          style={{
            left: state.paddleX,
            top: paddleTopPx,
            width: state.paddleW,
            height: state.paddleH,
          }}
        />

        {terminal && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "rgba(0,0,0,0.7)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              gap: 12,
            }}
          >
            <div className="pinball-overlay">
              <h2>Game Over</h2>
              <p>Score: {terminal.score}</p>
            </div>
          </div>
        )}
      </div>

      {!terminal && (
        <>
          <div className="pinball-controls">
            <button data-testid="hint-target-pinball-mini-action" onClick={() => dispatch({ type: "paddleLeft" } as PinballAction)}>◀ Left</button>
            <button onClick={() => dispatch({ type: "paddleRight" } as PinballAction)}>Right ▶</button>
          </div>
          <div className="pinball-hint">Mouse or Arrow Keys / A-D to move paddle</div>
        </>
      )}
    </div>
  );
}
