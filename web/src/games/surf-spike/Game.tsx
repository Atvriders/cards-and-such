import { useEffect, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { SurfSpikeState, SurfSpikeAction, SurfSpikeSettings } from "./state.js";
import { isTerminal, LANES } from "./state.js";
import "./Game.css";
export function SurfSpikeGame({ state, dispatch, onGameOver }: GameProps<SurfSpikeState, SurfSpikeSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    if (state.phase !== "playing") { if (tickRef.current) clearInterval(tickRef.current); return; }
    tickRef.current = setInterval(() => dispatch({ type: "tick" } as SurfSpikeAction), 750);
    return () => { if (tickRef.current) clearInterval(tickRef.current); };
  }, [state.phase, dispatch]);
  if (state.phase === "done") {
    return <div className="surfspike-wrap"><div className="surfspike-done"><h2>Time's Up!</h2><div>Popped: {state.popped} / Missed: {state.missed}</div><div className="surfspike-final">{state.score} pts</div></div></div>;
  }
  return (
    <div className="surfspike-wrap">
      <div className="surfspike-header">
        <span className="surfspike-info">Popped: {state.popped}</span>
        <span className="surfspike-timer">{state.ticksRemaining}s</span>
        <span className="surfspike-score pulse">{state.score} pts</span>
      </div>
      <div className="surfspike-board">
        {state.targets.map(p => {
          const x = (p.lane + 0.5) / LANES * 100;
          const y = 20 + ((p.ticksLeft * 23) % 70);
          return (
            <button key={p.id}
              className="surfspike-target" data-testid="hint-target-surf-spike-target"
              style={{ left: `${x}%`, top: `${y}%`, transform: "translate(-50%,-50%)", background:"transparent", border:"none" }}
              onClick={() => dispatch({ type:"pop", id:p.id } as SurfSpikeAction)}
              aria-label="target">🌊</button>
          );
        })}
      </div>
    </div>
  );
}
