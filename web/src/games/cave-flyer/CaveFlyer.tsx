import { useEffect, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { CaveFlyerState, CaveFlyerSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./CaveFlyer.css";

const W = 500;
const H = 340;
const PLAYER_X_PX = 75;

export function CaveFlyer({
  state,
  dispatch,
  onGameOver,
}: GameProps<CaveFlyerState, CaveFlyerSettings>): JSX.Element {
  const terminal = isTerminal(state);
  const rafRef = useRef<number | null>(null);
  const lastRef = useRef<number | null>(null);
  const thrustRef = useRef(false);

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
      if ((e.key === " " || e.key === "ArrowUp") && !thrustRef.current) {
        e.preventDefault();
        thrustRef.current = true;
        dispatch({ type: "thrust", on: true });
      }
    };
    const up = (e: KeyboardEvent) => {
      if (e.key === " " || e.key === "ArrowUp") {
        thrustRef.current = false;
        dispatch({ type: "thrust", on: false });
      }
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => { window.removeEventListener("keydown", down); window.removeEventListener("keyup", up); };
  }, [dispatch]);

  function onPointerDown() { dispatch({ type: "thrust", on: true }); }
  function onPointerUp() { dispatch({ type: "thrust", on: false }); }

  const { segments, playerY } = state;

  return (
    <div className="cave-flyer">
      <div className="cf-hud">
        <span>Score: {state.score}</span>
      </div>
      <div
        className="cf-field"
        style={{ width: W, height: H }}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
      >
        {segments.map((seg, i) => {
          const sx = seg.x * W;
          const sw = 0.04 * W + 1;
          return (
            <div key={i}>
              <div className="cf-wall cf-wall--top" style={{ left: sx, width: sw, height: seg.topY * H }} />
              <div className="cf-wall cf-wall--bot" style={{ left: sx, top: seg.botY * H, width: sw, height: (1 - seg.botY) * H }} />
            </div>
          );
        })}
        <div className="cf-player" style={{ left: PLAYER_X_PX - 12, top: playerY * H - 12 }}>
          🚁
        </div>
        {terminal && (
          <div className="cf-overlay">
            <h2>Crashed!</h2>
            <p>Score: {terminal.score}</p>
          </div>
        )}
      </div>
      <div className="cf-hint">Hold Space / click-hold to thrust upward</div>
    </div>
  );
}
