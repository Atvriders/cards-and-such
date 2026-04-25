import { useEffect, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { BottleFlipState } from "./state.js";
import { isTerminal } from "./state.js";
import type { bottleFlipSettings } from "./index.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import "./BottleFlip.css";

type BFSettings = SettingsOf<typeof bottleFlipSettings>;

export function BottleFlip({
  state,
  dispatch,
  onGameOver,
}: GameProps<BottleFlipState, BFSettings>): JSX.Element {
  const terminal = isTerminal(state);
  const rafRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);

  useEffect(() => {
    if (terminal) { onGameOver(terminal.score); return; }
    if (state.phase === "landing" || state.phase === "gameover") return;
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
      if (e.code === "Space") {
        e.preventDefault();
        dispatch({ type: "flip" });
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [dispatch]);

  // Bottle position: arc during flip, resting at bottom otherwise
  const bottomY = 240; // px from top of arena
  const altitude = state.altitude * 160;
  const bottleY = bottomY - altitude;
  const bottleX = 130; // center

  const powerPct = Math.round(state.power * 100);
  const powerColor = state.power < 0.4 ? "#68d391" : state.power < 0.7 ? "#f6ad55" : "#fc8181";

  return (
    <div className="bottle-flip">
      <div className="bf-info">
        <span>Round: <strong>{state.round}/{state.maxRounds}</strong></span>
        <span>Score: <strong>{state.score}</strong></span>
        {state.consecutiveLands > 1 && <span>Streak: <strong>{state.consecutiveLands}</strong></span>}
      </div>

      <div className="bf-arena">
        <div
          className="bf-bottle"
          style={{
            left: bottleX - 20,
            top: bottleY - 40,
            transform: `rotate(${state.rotation}deg)`,
          }}
        >
          🍶
        </div>
      </div>

      {state.phase === "aiming" && (
        <>
          <div className="bf-power-bar">
            <div
              className="bf-power-fill"
              style={{ width: `${powerPct}%`, background: powerColor }}
            />
          </div>
          <button className="bf-btn" onClick={() => dispatch({ type: "flip" })}>
            Flip! ({powerPct}%)
          </button>
          <div className="bf-hint">Press Space or click when power is just right</div>
        </>
      )}

      {state.phase === "flipping" && (
        <div className="bf-hint">Flipping...</div>
      )}

      {state.phase === "landing" && (
        <>
          <div className={`bf-result ${state.landed ? "success" : "miss"}`}>
            {state.landed
              ? `Landed! +${10 + (state.consecutiveLands - 1) * 5} pts`
              : "Missed! Keep trying"}
          </div>
          <button className="bf-btn" onClick={() => dispatch({ type: "flip" })}>
            Next Round
          </button>
        </>
      )}

      {terminal && (
        <div className="bf-result success">
          Final Score: {terminal.score}
        </div>
      )}
    </div>
  );
}
