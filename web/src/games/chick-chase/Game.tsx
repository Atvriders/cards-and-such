import { useEffect, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { ChickChaseState, ChickChaseAction, ChickChaseSettings } from "./state.js";
import { isTerminal, LANES } from "./state.js";
import "./Game.css";

export function ChickChaseGame({ state, dispatch, onGameOver }: GameProps<ChickChaseState, ChickChaseSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    if (state.phase !== "playing") { if (tickRef.current) clearInterval(tickRef.current); return; }
    tickRef.current = setInterval(() => dispatch({ type: "tick" } as ChickChaseAction), 750);
    return () => { if (tickRef.current) clearInterval(tickRef.current); };
  }, [state.phase, dispatch]);
  if (state.phase === "done") {
    return <div className="chk-wrap"><div className="chk-done"><h2>Time's Up!</h2><div>Caught: {state.popped} / Missed: {state.missed}</div><div className="chk-final">{state.score} pts</div></div></div>;
  }
  return (
    <div className="chk-wrap">
      <div className="chk-header">
        <span className="chk-info">Caught: {state.popped}</span>
        <span className="chk-timer">{state.ticksRemaining}s</span>
        <span className="chk-score">{state.score} pts</span>
      </div>
      <div className="chk-board" style={{ background: "linear-gradient(180deg,#fef9c3,#ca8a04)" }}>
        {state.critters.map(p => {
          const x = (p.lane + 0.5) / LANES * 100;
          const y = 20 + ((p.ticksLeft * 23) % 70);
          return (
            <button key={p.id}
              className="chk-target" data-testid="hint-target-chick-chase-target"
              style={{ left: `${x}%`, top: `${y}%`, transform: "translate(-50%,-50%)" }}
              onClick={() => dispatch({ type:"pop", id:p.id } as ChickChaseAction)}
              aria-label="chick-chase"
              data-tooltip="Tap to score in Chick Chase">🐤</button>
          );
        })}
      </div>
    </div>
  );
}
