import { useEffect, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { MushroomMashState, MushroomMashAction, MushroomMashSettings } from "./state.js";
import { isTerminal, LANES } from "./state.js";
import "./Game.css";

export function MushroomMashGame({ state, dispatch, onGameOver }: GameProps<MushroomMashState, MushroomMashSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    if (state.phase !== "playing") { if (tickRef.current) clearInterval(tickRef.current); return; }
    tickRef.current = setInterval(() => dispatch({ type: "tick" } as MushroomMashAction), 750);
    return () => { if (tickRef.current) clearInterval(tickRef.current); };
  }, [state.phase, dispatch]);
  if (state.phase === "done") {
    return <div className="msm-wrap"><div className="msm-done"><h2>Time's Up!</h2><div>Clicked: {state.clicked} / Missed: {state.missed}</div><div className="msm-final">{state.score} pts</div></div></div>;
  }
  return (
    <div className="msm-wrap">
      <div className="msm-header">
        <span className="msm-info">Clicked: {state.clicked}</span>
        <span className="msm-timer">{state.ticksRemaining}s</span>
        <span className="msm-score">{state.score} pts</span>
      </div>
      <div className="msm-board" style={{ background: "linear-gradient(180deg,#fecaca,#7f1d1d)" }}>
        {state.targets.map(p => {
          const x = (p.lane + 0.5) / LANES * 100;
          const y = 20 + ((p.ticksLeft * 23) % 70);
          return (
            <button key={p.id}
              className="msm-target" data-testid="hint-target-mushroom-mash-target"
              style={{ left: `${x}%`, top: `${y}%`, transform: "translate(-50%,-50%)" }}
              onClick={() => dispatch({ type:"click", id:p.id } as MushroomMashAction)}
              aria-label="mushroom-mash">🍄</button>
          );
        })}
      </div>
    </div>
  );
}
