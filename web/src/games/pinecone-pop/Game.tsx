import { useEffect, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { PineconePopState, PineconePopAction, PineconePopSettings } from "./state.js";
import { isTerminal, LANES } from "./state.js";
import "./Game.css";
export function PineconePopGame({ state, dispatch, onGameOver }: GameProps<PineconePopState, PineconePopSettings>): JSX.Element {
  const t = isTerminal(state); useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    if (state.phase !== "playing") { if (tickRef.current) clearInterval(tickRef.current); return; }
    tickRef.current = setInterval(() => dispatch({ type: "tick" } as PineconePopAction), 750);
    return () => { if (tickRef.current) clearInterval(tickRef.current); };
  }, [state.phase, dispatch]);
  if (state.phase === "done") return <div className="dm-wrap"><div className="dm-done"><h2>Time's Up!</h2><div>Clicked: {state.clicked} / Missed: {state.missed}</div><div className="dm-final">{state.score} pts</div></div></div>;
  return (
    <div className="dm-wrap">
      <div className="dm-row" style={{ justifyContent:"space-between", width:"100%" }}>
        <span style={{ fontSize:"0.9rem", color:"#555" }}>Clicked: {state.clicked}</span>
        <span style={{ fontSize:"1.4rem", fontWeight:900, color:"#e74c3c" }}>{state.ticksRemaining}s</span>
        <span className="dm-score">{state.score} pts</span>
      </div>
      <div className="dm-board" style={{ background:"linear-gradient(180deg,#264d26,#0e2c0e)" }}>
        {state.targets.map(t => {
          const x = (t.lane + 0.5) / LANES * 100;
          const y = 20 + ((t.ticksLeft * 23) % 70);
          return <button key={t.id} className="dm-target" style={{ left:`${x}%`, top:`${y}%`, transform:"translate(-50%,-50%)", color:"#fff" }} onClick={() => dispatch({ type:"click", id:t.id } as PineconePopAction)} aria-label="pinecone-pop">🌲</button>;
        })}
      </div>
    </div>
  );
}
