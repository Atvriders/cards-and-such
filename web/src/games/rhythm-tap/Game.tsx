import { useEffect, useRef, useCallback } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { RhythmTapState, RhythmTapAction } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

const PW = 360;
const PH = 480;
const LANE_W = PW / 4;
const LOOKAHEAD = 2.5; // seconds of beats shown ahead

const LANE_COLORS = ["#e05050", "#50c060", "#5080e0", "#e0c040"];
const LANE_KEYS = ["d", "f", "j", "k"];
const LANE_LABELS = ["D", "F", "J", "K"];

type Settings = { bpm: "60" | "90" | "120" };

export function RhythmTap({ state, dispatch }: GameProps<RhythmTapState, Settings>): JSX.Element {
  const stateRef = useRef(state);
  stateRef.current = state;

  const rafRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);

  const tick = useCallback((now: number) => {
    const s = stateRef.current;
    if (!s.over) {
      if (lastTimeRef.current !== null) {
        const dt = Math.min((now - lastTimeRef.current) / 1000, 0.05);
        dispatch({ type: "tick", dt } as RhythmTapAction);
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
      if (!s.started) { dispatch({ type: "start" } as RhythmTapAction); return; }
      const idx = LANE_KEYS.indexOf(e.key.toLowerCase());
      if (idx >= 0) { e.preventDefault(); dispatch({ type: "tap", lane: idx } as RhythmTapAction); }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [dispatch]);

  const terminal = isTerminal(state);
  const { elapsed, duration, combo, score, lives, beats } = state;
  const hitZoneY = PH * 0.85;

  const visibleBeats = beats.filter(
    (b) => !b.missed && b.time >= elapsed - 0.1 && b.time <= elapsed + LOOKAHEAD,
  );

  return (
    <div className="rt-game">
      <div className="rt-header">
        <span>Score: {score}</span>
        <span>Combo: x{combo}</span>
        <span>Lives: {"♥ ".repeat(Math.max(0, lives)).trim()}</span>
      </div>

      <div className="rt-progress">
        <div className="rt-progress-bar" style={{ width: `${Math.min(100, (elapsed / duration) * 100)}%` }} />
      </div>

      <div className="rt-playfield" style={{ width: PW, height: PH }}>
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="rt-lane" style={{ left: i * LANE_W, width: LANE_W, background: `${LANE_COLORS[i]}18` }} />
        ))}

        <div className="rt-hit-zone" style={{ top: hitZoneY }} />

        {visibleBeats.map((b) => {
          const yFraction = (b.time - elapsed) / LOOKAHEAD;
          const top = hitZoneY - yFraction * hitZoneY;
          return (
            <div
              key={b.id}
              className={`rt-beat${b.hit ? " rt-beat--hit" : ""}`}
              style={{
                left: b.lane * LANE_W + 4,
                top: top - 18,
                width: LANE_W - 8,
                height: 36,
                background: LANE_COLORS[b.lane],
              }}
            />
          );
        })}

        {!state.started && !terminal && (
          <div className="rt-overlay">
            <h2>Rhythm Tap</h2>
            <p>Press any key to start</p>
          </div>
        )}
        {terminal && (
          <div className="rt-overlay">
            <h2>Song Complete!</h2>
            <p>Score: {terminal.score}</p>
            <p>Max Combo: {state.maxCombo}</p>
          </div>
        )}
      </div>

      <div className="rt-buttons">
        {[0, 1, 2, 3].map((i) => (
          <button
            key={i}
            className="rt-tap-btn"
            style={{ background: LANE_COLORS[i] }}
            onClick={() => {
              if (!state.started) dispatch({ type: "start" } as RhythmTapAction);
              dispatch({ type: "tap", lane: i } as RhythmTapAction);
            }}
          >
            {LANE_LABELS[i]}
          </button>
        ))}
      </div>

      <div className="rt-hint">D · F · J · K to tap · Hit blocks as they reach the white line</div>
    </div>
  );
}
