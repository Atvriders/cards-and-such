import { useEffect, useCallback, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { UfoState, UfoAction, UfoSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./UfoRescue.css";

const TICK_MS = 50;
const UFO_W = 48;
const UFO_H = 20;

export function UfoRescue({
  state,
  dispatch,
}: GameProps<UfoState, UfoSettings>): JSX.Element {
  const stateRef = useRef(state);
  stateRef.current = state;

  const tick = useCallback(() => {
    dispatch({ type: "tick" } as UfoAction);
  }, [dispatch]);

  useEffect(() => {
    if (state.over) return;
    const id = setInterval(tick, TICK_MS);
    return () => clearInterval(id);
  }, [state.over, tick]);

  useEffect(() => {
    const held = { left: false, right: false };
    let moveInterval: ReturnType<typeof setInterval> | null = null;

    function startMoving() {
      if (moveInterval) return;
      moveInterval = setInterval(() => {
        const s = stateRef.current;
        if (s.over) return;
        if (held.left) dispatch({ type: "moveLeft" } as UfoAction);
        if (held.right) dispatch({ type: "moveRight" } as UfoAction);
      }, 50);
    }

    function stopMoving() {
      if (!held.left && !held.right && moveInterval) {
        clearInterval(moveInterval);
        moveInterval = null;
      }
    }

    function onKeyDown(e: KeyboardEvent) {
      const s = stateRef.current;
      if (s.over) return;
      if (e.key === "ArrowLeft" || e.key === "a") { held.left = true; startMoving(); e.preventDefault(); }
      if (e.key === "ArrowRight" || e.key === "d") { held.right = true; startMoving(); e.preventDefault(); }
      if (e.key === " " || e.key === "b" || e.key === "B") { dispatch({ type: "beam" } as UfoAction); e.preventDefault(); }
    }

    function onKeyUp(e: KeyboardEvent) {
      if (e.key === "ArrowLeft" || e.key === "a") { held.left = false; stopMoving(); }
      if (e.key === "ArrowRight" || e.key === "d") { held.right = false; stopMoving(); }
    }

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      if (moveInterval) clearInterval(moveInterval);
    };
  }, [dispatch]);

  const terminal = isTerminal(state);
  const ufoCenterX = state.ufoX + UFO_W / 2;
  const beamH = state.groundY - state.ufoY - UFO_H;

  return (
    <div className="ufo-game">
      <div className="ufo-header">
        <span>Rescued: {state.rescued}/{state.totalHumans}</span>
        <span>Score: {state.score}</span>
      </div>

      <div
        className="ufo-field"
        style={{ width: state.fieldW, height: state.fieldH }}
      >
        <div className="ufo-stars" />
        <div className="ufo-ground" />

        {/* Beam */}
        {state.beamActive && (
          <div
            className="ufo-beam"
            style={{
              left: ufoCenterX,
              top: state.ufoY + UFO_H,
              height: beamH,
            }}
          />
        )}

        {/* UFO */}
        <div
          className="ufo-ship"
          style={{ left: ufoCenterX, top: state.ufoY }}
        >
          🛸
        </div>

        {/* Humans */}
        {state.humans.map((h) => (
          <div
            key={h.id}
            className={`ufo-human${h.rescued ? " ufo-human--rescued" : ""}`}
            style={{ left: h.x, top: h.y }}
          >
            {h.rescued ? "✓" : h.onShip ? "😲" : "🧍"}
          </div>
        ))}

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
            <div className="ufo-overlay">
              <h2>All Rescued!</h2>
              <p>Score: {terminal.score}</p>
            </div>
          </div>
        )}
      </div>

      {!terminal && (
        <>
          <div className="ufo-controls">
            <button
              onMouseDown={() => { void dispatch({ type: "moveLeft" } as UfoAction); }}
              onMouseUp={() => {}}
              onClick={() => dispatch({ type: "moveLeft" } as UfoAction)}
            >◀</button>
            <button data-testid="hint-target-ufo-rescue-action"
              className={state.beamActive ? "active" : ""}
              onClick={() => dispatch({ type: "beam" } as UfoAction)}
            >
              {state.beamActive ? "Beam ON" : "Beam OFF"}
            </button>
            <button onClick={() => dispatch({ type: "moveRight" } as UfoAction)}>▶</button>
          </div>
          <div className="ufo-hint">Arrow/A-D to move · Space/B to toggle beam · Rescue all humans!</div>
        </>
      )}
    </div>
  );
}
