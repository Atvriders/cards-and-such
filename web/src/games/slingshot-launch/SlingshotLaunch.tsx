import { useEffect, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { SlingshotLaunchState } from "./state.js";
import { isTerminal } from "./state.js";
import type { slingshotLaunchSettings } from "./index.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import "./SlingshotLaunch.css";

type SLSettings = SettingsOf<typeof slingshotLaunchSettings>;

const W = 340;
const H = 280;

export function SlingshotLaunch({
  state,
  dispatch,
  onGameOver,
}: GameProps<SlingshotLaunchState, SLSettings>): JSX.Element {
  const terminal = isTerminal(state);
  const rafRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);

  useEffect(() => {
    if (terminal) { onGameOver(terminal.score); return; }
    if (state.phase === "scored" || state.phase === "gameover") return;
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
    const onKey = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault();
        if (state.phase === "pulling") dispatch({ type: "release" });
        else if (state.phase === "scored") dispatch({ type: "next" });
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [state.phase, dispatch]);

  const powerPct = state.pullPower * 100;
  const powerColor = state.pullPower < 0.4 ? "#68d391" : state.pullPower < 0.7 ? "#f6ad55" : "#fc8181";
  const hit = state.phase === "scored" && state.lastPts > 0;

  return (
    <div className="slingshot-launch">
      <div className="sl-info">
        <span>Round: <strong>{state.round}/{state.maxRounds}</strong></span>
        <span>Score: <strong>{state.score}</strong></span>
        <span>Shots: <strong>{state.shotsLeft}</strong></span>
      </div>

      <div className="sl-arena" style={{ width: W, height: H }}>
        {state.targets.map((t, i) => (
          <div
            key={i}
            className={`sl-target${i === state.hitTargetIdx ? " hit" : ""}`}
            style={{
              left: t.x * W,
              top: t.y * H,
              width: t.r * W * 2,
              height: t.r * W * 2,
            }}
          >
            {t.points}
          </div>
        ))}
        <div className="sl-sling">🏹</div>
        {state.phase === "pulling" && (
          <div
            className="sl-angle-indicator"
            style={{ transform: `rotate(-${state.pullAngle}deg)` }}
          />
        )}
        {(state.phase === "flying" || state.phase === "scored") && (
          <div
            className="sl-projectile"
            style={{
              left: Math.min(state.projectileX, 1) * W,
              top: Math.min(state.projectileY, 1) * H,
            }}
          />
        )}
      </div>

      {state.phase === "pulling" && (
        <>
          <div className="sl-power-bar">
            <div className="sl-power-fill" style={{ width: `${powerPct}%`, background: powerColor }} />
          </div>
          <button className="sl-btn" onClick={() => dispatch({ type: "release" })}>
            Release! ({Math.round(state.pullAngle)}°)
          </button>
          <div className="sl-hint">Time angle and power — Space or click</div>
        </>
      )}

      {state.phase === "flying" && (
        <div className="sl-hint">In flight...</div>
      )}

      {state.phase === "scored" && (
        <>
          <div className={`sl-result ${hit ? "hit" : "miss"}`}>
            {hit ? `Hit! +${state.lastPts} pts` : "Missed!"}
          </div>
          <button className="sl-btn" onClick={() => dispatch({ type: "next" })}>
            {state.shotsLeft > 0 ? `Next Shot (${state.shotsLeft} left)` : "Next Round"}
          </button>
        </>
      )}

      {terminal && (
        <div className="sl-result hit">Final Score: {terminal.score}</div>
      )}
    </div>
  );
}
