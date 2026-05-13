import { useEffect, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { BubbleBurstMiniState, BubbleBurstMiniAction, BubbleBurstMiniSettings } from "./state.js";
import { isTerminal, LANES } from "./state.js";
import "./Game.css";
export function BubbleBurstMiniGame({ state, dispatch, onGameOver }: GameProps<BubbleBurstMiniState, BubbleBurstMiniSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    if (state.phase !== "playing") { if (tickRef.current) clearInterval(tickRef.current); return; }
    tickRef.current = setInterval(() => dispatch({ type: "tick" } as BubbleBurstMiniAction), 750);
    return () => { if (tickRef.current) clearInterval(tickRef.current); };
  }, [state.phase, dispatch]);
  if (state.phase === "done") {
    return <div className="fc-wrap"><div className="fc-done bounce-in"><h2>Time's Up!</h2><div>Popped: {state.popped} / Missed: {state.missed}</div><div className="fc-final">{state.score} pts</div></div></div>;
  }
  return (
    <div className="fc-wrap fade-in">
      <div className="fc-header">
        <span className="fc-info">Caught: {state.popped}</span>
        <span className="fc-timer">{state.ticksRemaining}s</span>
        <span className="fc-score pulse">{state.score} pts</span>
      </div>
      <div className="fc-board">
        {state.items.map(p => {
          const x = (p.lane + 0.5) / LANES * 100;
          const y = 20 + ((p.ticksLeft * 23) % 70);
          return (
            <button key={p.id}
              className="fc-target" data-testid="hint-target-bubble-burst-mini-target"
              style={{ left: `${x}%`, top: `${y}%`, transform: "translate(-50%,-50%)", background:"transparent", border:"none" }}
              onClick={() => dispatch({ type:"pop", id:p.id } as BubbleBurstMiniAction)}
              aria-label="item"
              data-tooltip="Tap to score in Bubble Burst Mini">🫧</button>
          );
        })}
      </div>
    </div>
  );
}
