import { useEffect, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { NachosNowState, NachosNowAction, NachosNowSettings } from "./state.js";
import { isTerminal, LANES } from "./state.js";
import "./Game.css";

export function NachosNowGame({ state, dispatch, onGameOver }: GameProps<NachosNowState, NachosNowSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    if (state.phase !== "playing") { if (tickRef.current) clearInterval(tickRef.current); return; }
    tickRef.current = setInterval(() => dispatch({ type: "tick" } as NachosNowAction), 750);
    return () => { if (tickRef.current) clearInterval(tickRef.current); };
  }, [state.phase, dispatch]);
  if (state.phase === "done") {
    return <div className="nachosnow-wrap"><div className="nachosnow-done"><h2>Time's Up!</h2><div>Popped: {state.popped} / Missed: {state.missed}</div><div className="nachosnow-final">{state.score} pts</div></div></div>;
  }
  return (
    <div className="nachosnow-wrap">
      <div className="nachosnow-header">
        <span className="nachosnow-info">Popped: {state.popped}</span>
        <span className="nachosnow-timer">{state.ticksRemaining}s</span>
        <span className="nachosnow-score">{state.score} pts</span>
      </div>
      <div className="nachosnow-board" style={{ background: "linear-gradient(180deg,#fff5cc,#ff9a3c)" }}>
        {state.targets.map(p => {
          const x = (p.lane + 0.5) / LANES * 100;
          const y = 20 + ((p.ticksLeft * 23) % 70);
          return (
            <button key={p.id}
              className="nachosnow-target" data-testid="hint-target-nachos-now-target"
              style={{ left: `${x}%`, top: `${y}%`, transform: "translate(-50%,-50%)", background:"transparent", border:"none" }}
              onClick={() => dispatch({ type:"pop", id:p.id } as NachosNowAction)}
              aria-label="target">🌮</button>
          );
        })}
      </div>
    </div>
  );
}
