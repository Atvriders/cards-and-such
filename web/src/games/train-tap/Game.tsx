import { useEffect, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { TrainTapState, TrainTapAction, TrainTapSettings } from "./state.js";
import { isTerminal, LANES } from "./state.js";
import "./Game.css";

export function TrainTapGame({ state, dispatch, onGameOver }: GameProps<TrainTapState, TrainTapSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    if (state.phase !== "playing") { if (tickRef.current) clearInterval(tickRef.current); return; }
    tickRef.current = setInterval(() => dispatch({ type: "tick" } as TrainTapAction), 750);
    return () => { if (tickRef.current) clearInterval(tickRef.current); };
  }, [state.phase, dispatch]);
  if (state.phase === "done") {
    return <div className="trt-wrap"><div className="trt-done"><h2>Time's Up!</h2><div>Tapped: {state.popped} / Missed: {state.missed}</div><div className="trt-final">{state.score} pts</div></div></div>;
  }
  return (
    <div className="trt-wrap">
      <div className="trt-header">
        <span className="trt-info">Tapped: {state.popped}</span>
        <span className="trt-timer">{state.ticksRemaining}s</span>
        <span className="trt-score">{state.score} pts</span>
      </div>
      <div className="trt-board">
        {state.targets.map(p => {
          const x = (p.lane + 0.5) / LANES * 100;
          const y = 20 + ((p.ticksLeft * 23) % 70);
          return (
            <button key={p.id}
              className="trt-target"
              style={{ left: `${x}%`, top: `${y}%`, transform: "translate(-50%,-50%)", background:"transparent", border:"none" }}
              onClick={() => dispatch({ type:"pop", id:p.id } as TrainTapAction)}
              aria-label="vehicle">🚂</button>
          );
        })}
      </div>
    </div>
  );
}
