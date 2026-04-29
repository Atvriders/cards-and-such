import { useEffect, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { BananaBashState, BananaBashAction, BananaBashSettings } from "./state.js";
import { isTerminal, LANES } from "./state.js";
import "./Game.css";

export function BananaBashGame({ state, dispatch, onGameOver }: GameProps<BananaBashState, BananaBashSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    if (state.phase !== "playing") { if (tickRef.current) clearInterval(tickRef.current); return; }
    tickRef.current = setInterval(() => dispatch({ type: "tick" } as BananaBashAction), 750);
    return () => { if (tickRef.current) clearInterval(tickRef.current); };
  }, [state.phase, dispatch]);
  if (state.phase === "done") {
    return <div className="bananabash-wrap"><div className="bananabash-done"><h2>Time's Up!</h2><div>Popped: {state.popped} / Missed: {state.missed}</div><div className="bananabash-final">{state.score} pts</div></div></div>;
  }
  return (
    <div className="bananabash-wrap">
      <div className="bananabash-header">
        <span className="bananabash-info">Popped: {state.popped}</span>
        <span className="bananabash-timer">{state.ticksRemaining}s</span>
        <span className="bananabash-score">{state.score} pts</span>
      </div>
      <div className="bananabash-board">
        {state.targets.map(p => {
          const x = (p.lane + 0.5) / LANES * 100;
          const y = 20 + ((p.ticksLeft * 23) % 70);
          return (
            <button key={p.id}
              className="bananabash-target"
              style={{ left: `${x}%`, top: `${y}%`, transform: "translate(-50%,-50%)", background: "transparent", border: "none" }}
              onClick={() => dispatch({ type: "pop", id: p.id } as BananaBashAction)}
              aria-label="target">🍌</button>
          );
        })}
      </div>
    </div>
  );
}
