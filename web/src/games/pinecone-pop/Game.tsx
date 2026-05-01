import { useEffect, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { PineconePopState, PineconePopAction, PineconePopSettings } from "./state.js";
import { isTerminal, LANES } from "./state.js";
import "./Game.css";

export function PineconePopGame({ state, dispatch, onGameOver }: GameProps<PineconePopState, PineconePopSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    if (state.phase !== "playing") { if (tickRef.current) clearInterval(tickRef.current); return; }
    tickRef.current = setInterval(() => dispatch({ type: "tick" } as PineconePopAction), 750);
    return () => { if (tickRef.current) clearInterval(tickRef.current); };
  }, [state.phase, dispatch]);
  if (state.phase === "done") {
    return <div className="pcp-wrap"><div className="pcp-done"><h2>Time's Up!</h2><div>Clicked: {state.clicked} / Missed: {state.missed}</div><div className="pcp-final">{state.score} pts</div></div></div>;
  }
  return (
    <div className="pcp-wrap">
      <div className="pcp-header">
        <span className="pcp-info">Clicked: {state.clicked}</span>
        <span className="pcp-timer">{state.ticksRemaining}s</span>
        <span className="pcp-score">{state.score} pts</span>
      </div>
      <div className="pcp-board" style={{ background: "linear-gradient(180deg,#166534,#052e16)" }}>
        {state.targets.map(p => {
          const x = (p.lane + 0.5) / LANES * 100;
          const y = 20 + ((p.ticksLeft * 23) % 70);
          return (
            <button key={p.id}
              className="pcp-target"
              style={{ left: `${x}%`, top: `${y}%`, transform: "translate(-50%,-50%)" }}
              onClick={() => dispatch({ type:"click", id:p.id } as PineconePopAction)}
              aria-label="pinecone-pop">🌲</button>
          );
        })}
      </div>
    </div>
  );
}
