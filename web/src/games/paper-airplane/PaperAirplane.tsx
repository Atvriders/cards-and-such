import { useEffect, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { PaperAirplaneState } from "./state.js";
import { isTerminal } from "./state.js";
import type { paperAirplaneSettings } from "./index.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import "./PaperAirplane.css";

type PASettings = SettingsOf<typeof paperAirplaneSettings>;

const W = 360;
const H = 220;

export function PaperAirplane({
  state,
  dispatch,
  onGameOver,
}: GameProps<PaperAirplaneState, PASettings>): JSX.Element {
  const terminal = isTerminal(state);
  const rafRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);

  useEffect(() => {
    if (terminal) { onGameOver(terminal.score); return; }
    if (state.phase === "landed" || state.phase === "gameover") return;
    const tick = (now: number) => {
      if (lastTimeRef.current === null) lastTimeRef.current = now;
      const dt = Math.min((now - lastTimeRef.current) / 1000, 0.1);
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
      if (e.code === "Space") { e.preventDefault(); dispatch({ type: "launch" }); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [dispatch]);

  const planeLeft = state.planeX * W - 14;
  const planeTop = state.planeY * H - 14;
  const planeAngle = state.phase === "flying" ? -state.angle + Math.atan2(state.velY, state.velX) * 180 / Math.PI : -state.angle;
  const angleBarPct = ((state.angle - 5) / 65) * 100;

  return (
    <div className="paper-airplane">
      <div className="pa-info">
        <span>Round: <strong>{state.round}/{state.maxRounds}</strong></span>
        <span>Score: <strong>{state.score}</strong></span>
      </div>

      <div className="pa-arena" style={{ width: W, height: H }}>
        <div className="pa-target" style={{ left: state.targetX * W }}>🎯</div>
        <div
          className="pa-plane"
          style={{
            left: planeLeft,
            top: planeTop,
            transform: `rotate(${planeAngle}deg)`,
          }}
        >
          ✈️
        </div>
      </div>

      {state.phase === "aiming" && (
        <>
          <div className="pa-angle-bar">
            <div className="pa-angle-fill" style={{ width: `${angleBarPct}%` }} />
          </div>
          <button data-testid="hint-target-paper-airplane-action" className="pa-btn" onClick={() => dispatch({ type: "launch" })}>
            Launch! ({Math.round(state.angle)}°)
          </button>
          <div className="pa-hint">Aim for the target — press Space or click</div>
        </>
      )}

      {state.phase === "flying" && (
        <div className="pa-hint">Flying...</div>
      )}

      {state.phase === "landed" && (
        <>
          <div className="pa-result">+{state.distanceScore} pts</div>
          <button className="pa-btn" onClick={() => dispatch({ type: "launch" })}>Next Round</button>
        </>
      )}

      {terminal && (
        <div className="pa-result">Final Score: {terminal.score}</div>
      )}
    </div>
  );
}
