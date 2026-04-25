import { useEffect, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { BoomerangThrowState } from "./state.js";
import { isTerminal } from "./state.js";
import type { boomerangThrowSettings } from "./index.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import "./BoomerangThrow.css";

type BTSettings = SettingsOf<typeof boomerangThrowSettings>;

const W = 300;
const H = 260;

export function BoomerangThrow({
  state,
  dispatch,
  onGameOver,
}: GameProps<BoomerangThrowState, BTSettings>): JSX.Element {
  const terminal = isTerminal(state);
  const rafRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);

  useEffect(() => {
    if (terminal) { onGameOver(terminal.score); return; }
    if (state.phase === "caught" || state.phase === "gameover") return;
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
      if (e.code === "Space") { e.preventDefault(); dispatch({ type: "act" }); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [dispatch]);

  const chargePct = state.charge * 100;
  const chargeColor = state.charge < 0.4 ? "#68d391" : state.charge < 0.7 ? "#f6ad55" : "#fc8181";

  return (
    <div className="boomerang-throw">
      <div className="bt-info">
        <span>Round: <strong>{state.round}/{state.maxRounds}</strong></span>
        <span>Score: <strong>{state.score}</strong></span>
        {state.catches > 0 && <span>Catches: <strong>{state.catches}</strong></span>}
      </div>

      <div className="bt-arena" style={{ width: W, height: H }}>
        <div
          className="bt-boomerang"
          style={{
            left: state.boomX * W,
            top: state.boomY * H,
            transform: `translate(-50%, -50%) rotate(${state.angle}deg)`,
          }}
        >
          🪃
        </div>
        <div className="bt-player">🧍</div>
      </div>

      {state.phase === "charging" && (
        <>
          <div className="bt-label">Charge power</div>
          <div className="bt-charge-bar">
            <div className="bt-charge-fill" style={{ width: `${chargePct}%`, background: chargeColor }} />
          </div>
          <button className="bt-btn" onClick={() => dispatch({ type: "act" })}>Throw!</button>
        </>
      )}

      {state.phase === "flying" && (
        <div className="bt-label">Boomerang in flight...</div>
      )}

      {state.phase === "returning" && (
        <>
          <div className="bt-label">Catch it! — time your grab</div>
          <div className="bt-catch-center">
            <div className="bt-catch-zone" />
            <div className="bt-catch-bar">
              <div className="bt-catch-fill" style={{ width: `${state.catchIndicator * 100}%` }} />
            </div>
          </div>
          <button className="bt-btn" onClick={() => dispatch({ type: "act" })}>Catch!</button>
        </>
      )}

      {state.phase === "caught" && (
        <>
          <div className="bt-result">
            {state.lastPts > 0 ? `Caught! +${state.lastPts} pts` : "Missed catch!"}
          </div>
          <button className="bt-btn" onClick={() => dispatch({ type: "act" })}>Next Round</button>
        </>
      )}

      {terminal && (
        <div className="bt-result">Final Score: {terminal.score}</div>
      )}
    </div>
  );
}
