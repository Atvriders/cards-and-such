import { useEffect, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { CaterpillarCatchState, CaterpillarCatchAction, CaterpillarCatchSettings } from "./state.js";
import { isTerminal, LANES } from "./state.js";
import "./Game.css";

export function CaterpillarCatchGame({ state, dispatch, onGameOver }: GameProps<CaterpillarCatchState, CaterpillarCatchSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    if (state.phase !== "playing") { if (tickRef.current) clearInterval(tickRef.current); return; }
    tickRef.current = setInterval(() => dispatch({ type: "tick" } as CaterpillarCatchAction), 750);
    return () => { if (tickRef.current) clearInterval(tickRef.current); };
  }, [state.phase, dispatch]);
  if (state.phase === "done") {
    return <div className="ctc-wrap"><div className="ctc-done"><h2>Time's Up!</h2><div>Caught: {state.popped} / Missed: {state.missed}</div><div className="ctc-final">{state.score} pts</div></div></div>;
  }
  return (
    <div className="ctc-wrap">
      <div className="ctc-header">
        <span className="ctc-info">Caught: {state.popped}</span>
        <span className="ctc-timer">{state.ticksRemaining}s</span>
        <span className="ctc-score">{state.score} pts</span>
      </div>
      <div className="ctc-board" style={{ background: "linear-gradient(180deg,#bef264,#3f6212)" }}>
        {state.bugs.map(p => {
          const x = (p.lane + 0.5) / LANES * 100;
          const y = 20 + ((p.ticksLeft * 23) % 70);
          return (
            <button key={p.id}
              className="ctc-target" data-testid="hint-target-caterpillar-catch-target"
              style={{ left: `${x}%`, top: `${y}%`, transform: "translate(-50%,-50%)" }}
              onClick={() => dispatch({ type:"pop", id:p.id } as CaterpillarCatchAction)}
              aria-label="caterpillar-catch"
              data-tooltip="Tap to score in Caterpillar Catch">🐛</button>
          );
        })}
      </div>
    </div>
  );
}
