import { useEffect, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { TargetShooterState } from "./state.js";
import { isTerminal } from "./state.js";
import type { targetShooterSettings } from "./index.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import "./TargetShooter.css";

type TSSettings = SettingsOf<typeof targetShooterSettings>;

const W = 320;
const H = 240;

export function TargetShooter({
  state,
  dispatch,
  onGameOver,
}: GameProps<TargetShooterState, TSSettings>): JSX.Element {
  const terminal = isTerminal(state);
  const rafRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);

  useEffect(() => {
    if (terminal) { onGameOver(terminal.score); return; }
    if (state.phase !== "aiming") return;
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
      if (e.code === "Space" || e.code === "KeyF") {
        e.preventDefault();
        dispatch({ type: "fire" });
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [dispatch]);

  const targetPxR = state.target.r * W;
  const hit = state.phase === "shot" && state.lastPoints > 0;

  return (
    <div className="target-shooter">
      <div className="ts-info">
        <span>Round: <strong>{state.round}/{state.maxRounds}</strong></span>
        <span>Score: <strong>{state.score}</strong></span>
      </div>

      <div className="ts-arena" style={{ width: W, height: H }} onClick={() => dispatch({ type: "fire" })}>
        <div
          className="ts-target"
          style={{
            left: state.target.x * W,
            top: state.target.y * H,
            width: targetPxR * 2,
            height: targetPxR * 2,
          }}
        />
        {state.phase === "aiming" && (
          <div
            className="ts-crosshair"
            style={{ left: state.crosshairX * W, top: state.crosshairY * H }}
          />
        )}
        {state.phase === "shot" && (
          <div
            className="ts-shot-marker"
            style={{ left: state.shotX * W, top: state.shotY * H }}
          />
        )}
      </div>

      {state.phase === "aiming" && (
        <>
          <button data-testid="hint-target-target-shooter-action" className="ts-btn" onClick={() => dispatch({ type: "fire" })}>Fire! (Space/F)</button>
          <div className="ts-hint">Crosshair drifts — fire when it overlaps the target</div>
        </>
      )}

      {state.phase === "shot" && (
        <>
          <div className={`ts-result ${hit ? "hit" : "miss"}`}>
            {hit ? `Hit! +${state.lastPoints} pts` : "Missed!"}
          </div>
          {state.round < state.maxRounds ? (
            <button className="ts-btn" onClick={() => dispatch({ type: "next", seed: state.round * 77 + 13 })}>
              Next Target
            </button>
          ) : null}
        </>
      )}

      {terminal && (
        <div className="ts-result hit">Final Score: {terminal.score}</div>
      )}
    </div>
  );
}
