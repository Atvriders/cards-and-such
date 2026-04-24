import { useEffect, useRef, useCallback } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { ColorMatchState, ColorMatchAction, Color } from "./state.js";
import { isTerminal, COLORS } from "./state.js";
import "./Game.css";

const PW = 380;
const PH = 520;

const COLOR_HEX: Record<Color, string> = {
  red: "#e03030",
  green: "#30b050",
  blue: "#3070e0",
  yellow: "#d0b020",
};

const KEY_MAP: Record<string, Color> = {
  a: "red", A: "red",
  s: "green", S: "green",
  d: "blue", D: "blue",
  f: "yellow", F: "yellow",
};

type Settings = { speed: "slow" | "normal" | "fast" };

export function ColorMatchDash({ state, dispatch }: GameProps<ColorMatchState, Settings>): JSX.Element {
  const stateRef = useRef(state);
  stateRef.current = state;

  const rafRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);

  const tick = useCallback((now: number) => {
    const s = stateRef.current;
    if (!s.over) {
      if (lastTimeRef.current !== null) {
        const dt = Math.min((now - lastTimeRef.current) / 1000, 0.05);
        dispatch({ type: "tick", dt } as ColorMatchAction);
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

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const s = stateRef.current;
      if (!s.started) { dispatch({ type: "start" } as ColorMatchAction); return; }
      const color = KEY_MAP[e.key];
      if (color) { e.preventDefault(); dispatch({ type: "press", color } as ColorMatchAction); }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [dispatch]);

  const terminal = isTerminal(state);
  const laneXs = [0.125, 0.375, 0.625, 0.875];

  return (
    <div className="cmd-game">
      <div className="cmd-header">
        <span>Score: {state.score}</span>
        <span>Lives: {"❤".repeat(Math.max(0, state.lives))}</span>
      </div>

      <div className="cmd-playfield" style={{ width: PW, height: PH }}>
        {[0.25, 0.5, 0.75].map((x) => (
          <div key={x} className="cmd-lane-divider" style={{ left: x * PW }} />
        ))}

        {state.fallingItems.map((f) => (
          <div
            key={f.id}
            className="cmd-falling"
            style={{
              left: f.x * PW,
              top: f.y * PH - 24,
              background: COLOR_HEX[f.color],
            }}
          >
            {f.color.toUpperCase()}
          </div>
        ))}

        {/* Hit zone line */}
        <div style={{ position: "absolute", left: 0, right: 0, top: 0.8 * PH, height: 2, background: "rgba(255,255,255,0.3)" }} />

        {!state.started && !terminal && (
          <div className="cmd-overlay">
            <h2>Color Match Dash</h2>
            <p>Press any key or button to start</p>
          </div>
        )}
        {terminal && (
          <div className="cmd-overlay">
            <h2>Game Over</h2>
            <p>Score: {terminal.score}</p>
          </div>
        )}
      </div>

      <div className="cmd-buttons">
        {COLORS.map((c) => (
          <button
            key={c}
            className="cmd-button"
            style={{ background: COLOR_HEX[c] }}
            onClick={() => {
              if (!state.started) dispatch({ type: "start" } as ColorMatchAction);
              dispatch({ type: "press", color: c } as ColorMatchAction);
            }}
          >
            {c.toUpperCase()}<br /><span style={{ fontSize: "0.7rem", opacity: 0.8 }}>
              {c === "red" ? "A" : c === "green" ? "S" : c === "blue" ? "D" : "F"}
            </span>
          </button>
        ))}
      </div>

      <div className="cmd-hint">A=Red · S=Green · D=Blue · F=Yellow · Hit colors in the zone!</div>
    </div>
  );
}
