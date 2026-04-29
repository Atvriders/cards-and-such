import { useEffect, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { PumpkinSmashState, PumpkinSmashAction, PumpkinSmashSettings } from "./state.js";
import { isTerminal, LANES } from "./state.js";
import "./Game.css";

export function PumpkinSmashGame({ state, dispatch, onGameOver }: GameProps<PumpkinSmashState, PumpkinSmashSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    if (state.phase !== "playing") { if (tickRef.current) clearInterval(tickRef.current); return; }
    tickRef.current = setInterval(() => dispatch({ type: "tick" } as PumpkinSmashAction), 750);
    return () => { if (tickRef.current) clearInterval(tickRef.current); };
  }, [state.phase, dispatch]);
  if (state.phase === "done") {
    return <div className="pumpkinsmash-wrap"><div className="pumpkinsmash-done"><h2>Time's Up!</h2><div>Popped: {state.popped} / Missed: {state.missed}</div><div className="pumpkinsmash-final">{state.score} pts</div></div></div>;
  }
  return (
    <div className="pumpkinsmash-wrap">
      <div className="pumpkinsmash-header">
        <span className="pumpkinsmash-info">Popped: {state.popped}</span>
        <span className="pumpkinsmash-timer">{state.ticksRemaining}s</span>
        <span className="pumpkinsmash-score">{state.score} pts</span>
      </div>
      <div className="pumpkinsmash-board">
        {state.targets.map(p => {
          const x = (p.lane + 0.5) / LANES * 100;
          const y = 20 + ((p.ticksLeft * 23) % 70);
          return (
            <button key={p.id}
              className="pumpkinsmash-target"
              style={{ left: `${x}%`, top: `${y}%`, transform: "translate(-50%,-50%)", background: "transparent", border: "none" }}
              onClick={() => dispatch({ type: "pop", id: p.id } as PumpkinSmashAction)}
              aria-label="target">🎃</button>
          );
        })}
      </div>
    </div>
  );
}
