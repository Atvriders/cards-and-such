import { useEffect, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { JellyfishJabState, JellyfishJabAction, JellyfishJabSettings } from "./state.js";
import { isTerminal, LANES } from "./state.js";
import "./Game.css";

export function JellyfishJabGame({ state, dispatch, onGameOver }: GameProps<JellyfishJabState, JellyfishJabSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    if (state.phase !== "playing") { if (tickRef.current) clearInterval(tickRef.current); return; }
    tickRef.current = setInterval(() => dispatch({ type: "tick" } as JellyfishJabAction), 750);
    return () => { if (tickRef.current) clearInterval(tickRef.current); };
  }, [state.phase, dispatch]);
  if (state.phase === "done") {
    return <div className="jj-wrap"><div className="jj-done"><h2>Time's Up!</h2><div>Caught: {state.popped} / Missed: {state.missed}</div><div className="jj-final">{state.score} pts</div></div></div>;
  }
  return (
    <div className="jj-wrap">
      <div className="jj-header">
        <span className="jj-info">Caught: {state.popped}</span>
        <span className="jj-timer">{state.ticksRemaining}s</span>
        <span className="jj-score">{state.score} pts</span>
      </div>
      <div className="jj-board" style={{ background: "linear-gradient(180deg,#bae6fd,#1e3a8a)" }}>
        {state.critters.map(p => {
          const x = (p.lane + 0.5) / LANES * 100;
          const y = 20 + ((p.ticksLeft * 23) % 70);
          return (
            <button key={p.id}
              className="jj-target" data-testid="hint-target-jellyfish-jab-target"
              style={{ left: `${x}%`, top: `${y}%`, transform: "translate(-50%,-50%)" }}
              onClick={() => dispatch({ type:"pop", id:p.id } as JellyfishJabAction)}
              aria-label="jellyfish-jab">🪼</button>
          );
        })}
      </div>
    </div>
  );
}
