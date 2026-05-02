import { useEffect, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { AntAttackState, AntAttackAction, AntAttackSettings } from "./state.js";
import { isTerminal, LANES } from "./state.js";
import "./Game.css";

export function AntAttackGame({ state, dispatch, onGameOver }: GameProps<AntAttackState, AntAttackSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    if (state.phase !== "playing") { if (tickRef.current) clearInterval(tickRef.current); return; }
    tickRef.current = setInterval(() => dispatch({ type: "tick" } as AntAttackAction), 750);
    return () => { if (tickRef.current) clearInterval(tickRef.current); };
  }, [state.phase, dispatch]);
  if (state.phase === "done") {
    return <div className="aa-wrap"><div className="aa-done"><h2>Time's Up!</h2><div>Caught: {state.popped} / Missed: {state.missed}</div><div className="aa-final">{state.score} pts</div></div></div>;
  }
  return (
    <div className="aa-wrap">
      <div className="aa-header">
        <span className="aa-info">Caught: {state.popped}</span>
        <span className="aa-timer">{state.ticksRemaining}s</span>
        <span className="aa-score">{state.score} pts</span>
      </div>
      <div className="aa-board" style={{ background: "linear-gradient(180deg,#fcd34d,#92400e)" }}>
        {state.critters.map(p => {
          const x = (p.lane + 0.5) / LANES * 100;
          const y = 20 + ((p.ticksLeft * 23) % 70);
          return (
            <button key={p.id}
              className="aa-target"
              style={{ left: `${x}%`, top: `${y}%`, transform: "translate(-50%,-50%)" }}
              onClick={() => dispatch({ type:"pop", id:p.id } as AntAttackAction)}
              aria-label="ant-attack"
              data-tooltip="Tap to score in Ant Attack">🐜</button>
          );
        })}
      </div>
    </div>
  );
}
