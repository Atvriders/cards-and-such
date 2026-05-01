import { useEffect, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { KittenClickState, KittenClickAction, KittenClickSettings } from "./state.js";
import { isTerminal, LANES } from "./state.js";
import "./Game.css";

export function KittenClickGame({ state, dispatch, onGameOver }: GameProps<KittenClickState, KittenClickSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    if (state.phase !== "playing") { if (tickRef.current) clearInterval(tickRef.current); return; }
    tickRef.current = setInterval(() => dispatch({ type: "tick" } as KittenClickAction), 750);
    return () => { if (tickRef.current) clearInterval(tickRef.current); };
  }, [state.phase, dispatch]);
  if (state.phase === "done") {
    return <div className="kc-wrap"><div className="kc-done"><h2>Time's Up!</h2><div>Clicked: {state.popped} / Missed: {state.missed}</div><div className="kc-final">{state.score} pts</div></div></div>;
  }
  return (
    <div className="kc-wrap">
      <div className="kc-header">
        <span className="kc-info">Clicked: {state.popped}</span>
        <span className="kc-timer">{state.ticksRemaining}s</span>
        <span className="kc-score">{state.score} pts</span>
      </div>
      <div className="kc-board" style={{ background: "linear-gradient(180deg,#fde68a,#b45309)" }}>
        {state.targets.map(p => {
          const x = (p.lane + 0.5) / LANES * 100;
          const y = 20 + ((p.ticksLeft * 23) % 70);
          return (
            <button key={p.id}
              className="kc-target"
              style={{ left: `${x}%`, top: `${y}%`, transform: "translate(-50%,-50%)" }}
              onClick={() => dispatch({ type:"pop", id:p.id } as KittenClickAction)}
              aria-label="kitten-click">🐱</button>
          );
        })}
      </div>
    </div>
  );
}
