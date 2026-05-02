import { useEffect, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { FrisbeeTossState } from "./state.js";
import { isTerminal } from "./state.js";
import type { frisbeeTossSettings } from "./index.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import "./FrisbeeToss.css";

type FTSettings = SettingsOf<typeof frisbeeTossSettings>;

const W = 320;
const H = 240;

export function FrisbeeToss({
  state,
  dispatch,
  onGameOver,
}: GameProps<FrisbeeTossState, FTSettings>): JSX.Element {
  const terminal = isTerminal(state);
  const rafRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);

  useEffect(() => {
    if (terminal) { onGameOver(terminal.score); return; }
    if (state.phase === "scored" || state.phase === "gameover") return;
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
      if (e.code === "Space") { e.preventDefault(); dispatch({ type: "throw" }); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [dispatch]);

  return (
    <div className="frisbee-toss">
      <div className="ft-info">
        <span>Round: <strong>{state.round}/{state.maxRounds}</strong></span>
        <span>Score: <strong>{state.score}</strong></span>
      </div>

      <div className="ft-arena" style={{ width: W, height: H }}>
        <div className="ft-ring" style={{ left: state.ringX * W, top: state.ringY * H }}>🎯</div>
        {state.phase === "aiming" && (
          <div className="ft-aim-line" style={{ left: state.aimX * W }} />
        )}
        <div
          className="ft-frisbee"
          style={{ left: state.frisbeeX * W, top: state.frisbeeY * H }}
        >
          🥏
        </div>
      </div>

      {state.phase === "aiming" && (
        <>
          <button data-testid="hint-target-frisbee-toss-action" className="ft-btn" onClick={() => dispatch({ type: "throw" })}>Toss!</button>
          <div className="ft-hint">Time your throw to align with the target — Space or click</div>
        </>
      )}

      {state.phase === "throwing" && (
        <div className="ft-hint">Flying...</div>
      )}

      {state.phase === "scored" && (
        <>
          <div className="ft-result">+{state.lastPoints} pts</div>
          <button className="ft-btn" onClick={() => dispatch({ type: "throw" })}>Next Round</button>
        </>
      )}

      {terminal && (
        <div className="ft-result">Final Score: {terminal.score}</div>
      )}
    </div>
  );
}
