import { useEffect, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { BunnyBounceState, BunnyBounceAction, BunnyBounceSettings } from "./state.js";
import { isTerminal, LANES } from "./state.js";
import "./Game.css";

export function BunnyBounceGame({ state, dispatch, onGameOver }: GameProps<BunnyBounceState, BunnyBounceSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    if (state.phase !== "playing") { if (tickRef.current) clearInterval(tickRef.current); return; }
    tickRef.current = setInterval(() => dispatch({ type: "tick" } as BunnyBounceAction), 750);
    return () => { if (tickRef.current) clearInterval(tickRef.current); };
  }, [state.phase, dispatch]);
  if (state.phase === "done") {
    return <div className="bb-wrap"><div className="bb-done"><h2>Time's Up!</h2><div>Caught: {state.popped} / Missed: {state.missed}</div><div className="bb-final">{state.score} pts</div></div></div>;
  }
  return (
    <div className="bb-wrap">
      <div className="bb-header">
        <span className="bb-info">Caught: {state.popped}</span>
        <span className="bb-timer">{state.ticksRemaining}s</span>
        <span className="bb-score">{state.score} pts</span>
      </div>
      <div className="bb-board" style={{ background: "linear-gradient(180deg,#fbcfe8,#be185d)" }}>
        {state.critters.map(p => {
          const x = (p.lane + 0.5) / LANES * 100;
          const y = 20 + ((p.ticksLeft * 23) % 70);
          return (
            <button key={p.id}
              className="bb-target" data-testid="hint-target-bunny-bounce-target"
              style={{ left: `${x}%`, top: `${y}%`, transform: "translate(-50%,-50%)" }}
              onClick={() => dispatch({ type:"pop", id:p.id } as BunnyBounceAction)}
              aria-label="bunny-bounce"
              data-tooltip="Tap to score in Bunny Bounce">🐰</button>
          );
        })}
      </div>
    </div>
  );
}
