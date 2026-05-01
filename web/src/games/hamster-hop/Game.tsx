import { useEffect, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { HamsterHopState, HamsterHopAction, HamsterHopSettings } from "./state.js";
import { isTerminal, LANES } from "./state.js";
import "./Game.css";

export function HamsterHopGame({ state, dispatch, onGameOver }: GameProps<HamsterHopState, HamsterHopSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    if (state.phase !== "playing") { if (tickRef.current) clearInterval(tickRef.current); return; }
    tickRef.current = setInterval(() => dispatch({ type: "tick" } as HamsterHopAction), 750);
    return () => { if (tickRef.current) clearInterval(tickRef.current); };
  }, [state.phase, dispatch]);
  if (state.phase === "done") {
    return <div className="hh-wrap"><div className="hh-done"><h2>Time's Up!</h2><div>Tapped: {state.popped} / Missed: {state.missed}</div><div className="hh-final">{state.score} pts</div></div></div>;
  }
  return (
    <div className="hh-wrap">
      <div className="hh-header">
        <span className="hh-info">Tapped: {state.popped}</span>
        <span className="hh-timer">{state.ticksRemaining}s</span>
        <span className="hh-score">{state.score} pts</span>
      </div>
      <div className="hh-board" style={{ background: "linear-gradient(180deg,#fde68a,#a16207)" }}>
        {state.targets.map(p => {
          const x = (p.lane + 0.5) / LANES * 100;
          const y = 20 + ((p.ticksLeft * 23) % 70);
          return (
            <button key={p.id}
              className="hh-target"
              style={{ left: `${x}%`, top: `${y}%`, transform: "translate(-50%,-50%)" }}
              onClick={() => dispatch({ type:"pop", id:p.id } as HamsterHopAction)}
              aria-label="hamster-hop">🐹</button>
          );
        })}
      </div>
    </div>
  );
}
