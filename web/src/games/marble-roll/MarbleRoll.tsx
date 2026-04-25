import { useEffect, useRef, useCallback } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { MarbleRollState } from "./state.js";
import { isTerminal } from "./state.js";
import type { marbleRollSettings } from "./index.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import "./MarbleRoll.css";

type MRSettings = SettingsOf<typeof marbleRollSettings>;

const W = 300;
const H = 280;
const MARBLE_PX = 18;
const HOLE_PX = 26;

export function MarbleRoll({
  state,
  dispatch,
  onGameOver,
}: GameProps<MarbleRollState, MRSettings>): JSX.Element {
  const terminal = isTerminal(state);
  const rafRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);

  useEffect(() => {
    if (terminal) { onGameOver(terminal.score); return; }
    if (state.phase !== "rolling") return;
    const tick = (now: number) => {
      if (lastTimeRef.current === null) lastTimeRef.current = now;
      const dt = Math.min((now - lastTimeRef.current) / 1000, 0.05);
      lastTimeRef.current = now;
      dispatch({ type: "tick", dt });
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      lastTimeRef.current = null;
    };
  }, [terminal, state.phase, dispatch, onGameOver]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === "ArrowLeft") { e.preventDefault(); dispatch({ type: "tilt", dir: "left" }); }
      if (e.code === "ArrowRight") { e.preventDefault(); dispatch({ type: "tilt", dir: "right" }); }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code === "ArrowLeft" || e.code === "ArrowRight") {
        dispatch({ type: "tilt", dir: "none" });
      }
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, [dispatch]);

  const timerPct = Math.max(0, 1 - state.elapsed / state.timeLimit);
  const timerColor = timerPct > 0.5 ? "#48bb78" : timerPct > 0.25 ? "#f6ad55" : "#fc8181";

  const handleLeft = useCallback(() => dispatch({ type: "tilt", dir: "left" }), [dispatch]);
  const handleRight = useCallback(() => dispatch({ type: "tilt", dir: "right" }), [dispatch]);
  const handleRelease = useCallback(() => dispatch({ type: "tilt", dir: "none" }), [dispatch]);

  return (
    <div className="marble-roll">
      <div className="mr-info">
        <span>Round: <strong>{state.round}/{state.maxRounds}</strong></span>
        <span>Score: <strong>{state.score}</strong></span>
      </div>

      <div className="mr-arena" style={{ width: W, height: H }}>
        <div
          className="mr-hole"
          style={{
            left: state.holeX * W,
            top: state.holeY * H,
            width: HOLE_PX,
            height: HOLE_PX,
          }}
        />
        <div
          className="mr-marble"
          style={{
            left: state.marbleX * W,
            top: state.marbleY * H,
            width: MARBLE_PX,
            height: MARBLE_PX,
          }}
        />
      </div>

      {state.phase === "rolling" && (
        <>
          <div className="mr-timer">
            <div className="mr-timer-fill" style={{ width: `${timerPct * 100}%`, background: timerColor }} />
          </div>
          <div className="mr-controls">
            <button
              className="mr-tilt-btn"
              onMouseDown={handleLeft}
              onMouseUp={handleRelease}
              onTouchStart={handleLeft}
              onTouchEnd={handleRelease}
            >
              ◀ Left
            </button>
            <button
              className="mr-tilt-btn"
              onMouseDown={handleRight}
              onMouseUp={handleRelease}
              onTouchStart={handleRight}
              onTouchEnd={handleRelease}
            >
              Right ▶
            </button>
          </div>
          <div className="mr-hint">Guide the marble into the hole — arrow keys or buttons</div>
        </>
      )}

      {state.phase === "scored" && (
        <>
          <div className={`mr-result ${state.lastPts > 0 ? "scored" : "miss"}`}>
            {state.lastPts > 0 ? `In the hole! +${state.lastPts} pts` : "Time up!"}
          </div>
          <button className="mr-btn" onClick={() => dispatch({ type: "next" })}>Next Round</button>
        </>
      )}

      {terminal && (
        <div className="mr-result scored">Final Score: {terminal.score}</div>
      )}
    </div>
  );
}
