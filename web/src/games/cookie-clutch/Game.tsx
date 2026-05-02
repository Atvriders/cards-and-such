import { useEffect, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { CookieClutchState, CookieClutchAction, CookieClutchSettings } from "./state.js";
import { isTerminal, LANES } from "./state.js";
import "./Game.css";

export function CookieClutchGame({ state, dispatch, onGameOver }: GameProps<CookieClutchState, CookieClutchSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    if (state.phase !== "playing") { if (tickRef.current) clearInterval(tickRef.current); return; }
    tickRef.current = setInterval(() => dispatch({ type: "tick" } as CookieClutchAction), 750);
    return () => { if (tickRef.current) clearInterval(tickRef.current); };
  }, [state.phase, dispatch]);
  if (state.phase === "done") {
    return <div className="cookieclutch-wrap"><div className="cookieclutch-done"><h2>Time's Up!</h2><div>Popped: {state.popped} / Missed: {state.missed}</div><div className="cookieclutch-final">{state.score} pts</div></div></div>;
  }
  return (
    <div className="cookieclutch-wrap">
      <div className="cookieclutch-header">
        <span className="cookieclutch-info">Popped: {state.popped}</span>
        <span className="cookieclutch-timer">{state.ticksRemaining}s</span>
        <span className="cookieclutch-score">{state.score} pts</span>
      </div>
      <div className="cookieclutch-board">
        {state.items.map(p => {
          const x = (p.lane + 0.5) / LANES * 100;
          const y = 20 + ((p.ticksLeft * 23) % 70);
          return (
            <button key={p.id}
              className="cookieclutch-target" data-testid="hint-target-cookie-clutch-target"
              style={{ left: `${x}%`, top: `${y}%`, transform: "translate(-50%,-50%)", background:"transparent", border:"none" }}
              onClick={() => dispatch({ type:"pop", id:p.id } as CookieClutchAction)}
              aria-label="Cookie Clutch"
              data-tooltip="Tap to score in Cookie Clutch">🍪</button>
          );
        })}
      </div>
    </div>
  );
}
