import { useEffect, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DodgeCarsState, DodgeCarsSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./DodgeCars.css";

const W = 360;
const H = 520;
const PLAYER_Y_FRAC = 0.85;

const CAR_EMOJIS = ["🚗", "🚕", "🚙", "🚌", "🏎️"];

export function DodgeCars({
  state,
  dispatch,
  onGameOver,
}: GameProps<DodgeCarsState, DodgeCarsSettings>): JSX.Element {
  const terminal = isTerminal(state);
  const rafRef = useRef<number | null>(null);
  const lastRef = useRef<number | null>(null);

  useEffect(() => {
    if (terminal) { onGameOver(terminal.score); return; }
    const tick = (now: number) => {
      if (lastRef.current === null) lastRef.current = now;
      const dt = Math.min((now - lastRef.current) / 1000, 0.05);
      lastRef.current = now;
      dispatch({ type: "tick", dt });
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      lastRef.current = null;
    };
  }, [terminal, dispatch, onGameOver]);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      const lanes = parseInt(state.settings.lanes, 10);
      if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") {
        e.preventDefault();
        dispatch({ type: "move", lane: state.playerLane - 1 });
      } else if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") {
        e.preventDefault();
        dispatch({ type: "move", lane: state.playerLane + 1 });
      }
    };
    window.addEventListener("keydown", down);
    return () => window.removeEventListener("keydown", down);
  }, [dispatch, state.playerLane, state.settings.lanes]);

  const lanes = parseInt(state.settings.lanes, 10);
  const laneW = W / lanes;

  return (
    <div className="dodge-cars">
      <div className="dc-hud">
        <span>Score: {state.score}</span>
        <span>Time: {state.elapsed.toFixed(1)}s</span>
      </div>
      <div className="dc-road" style={{ width: W, height: H }}>
        {/* Lane dividers */}
        {Array.from({ length: lanes - 1 }, (_, i) => (
          <div key={i} className="dc-lane-line" style={{ left: laneW * (i + 1) }} />
        ))}
        {/* Cars */}
        {state.cars.map((car, idx) => (
          <div
            key={car.id}
            className="dc-car dc-car--enemy"
            style={{ left: car.lane * laneW + laneW / 2 - 20, top: car.y * H - 28, fontSize: 32 }}
          >
            {CAR_EMOJIS[idx % CAR_EMOJIS.length]}
          </div>
        ))}
        {/* Player */}
        <div
          className="dc-car dc-car--player"
          style={{ left: state.playerLane * laneW + laneW / 2 - 20, top: PLAYER_Y_FRAC * H - 28, fontSize: 32 }}
        >
          🚘
        </div>
        {terminal && (
          <div className="dc-overlay">
            <h2>Crash!</h2>
            <p>Score: {terminal.score}</p>
          </div>
        )}
      </div>
      <div className="dc-btn-row">
        <button data-testid="hint-target-dodge-cars-action" title="Move left" onClick={() => dispatch({ type: "move", lane: state.playerLane - 1 })}>◀</button>
        <button title="Move right" onClick={() => dispatch({ type: "move", lane: state.playerLane + 1 })}>▶</button>
      </div>
      <div className="dc-hint">Arrow keys / A-D to change lanes</div>
    </div>
  );
}
