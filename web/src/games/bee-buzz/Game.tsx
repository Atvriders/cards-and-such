import { useEffect, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { BeeBuzzState, BeeBuzzAction, BeeBuzzSettings } from "./state.js";
import { isTerminal, LANES } from "./state.js";
import "./Game.css";
export function BeeBuzzGame({ state, dispatch, onGameOver }: GameProps<BeeBuzzState, BeeBuzzSettings>): JSX.Element {
  const t=isTerminal(state);
  useEffect(()=>{ if(t) onGameOver(t.score); },[t,onGameOver]);
  const tickRef=useRef<ReturnType<typeof setInterval>|null>(null);
  useEffect(()=>{
    if (state.phase!=="playing") { if (tickRef.current) clearInterval(tickRef.current); return; }
    tickRef.current=setInterval(()=>dispatch({type:"tick"} as BeeBuzzAction),750);
    return ()=>{ if (tickRef.current) clearInterval(tickRef.current); };
  },[state.phase,dispatch]);
  if (state.phase==="done") {
    return <div className="fc-wrap"><div className="fc-done"><h2>Time's Up!</h2><div>Bees: {state.popped} / Missed: {state.missed}</div><div className="fc-final">{state.score} pts</div></div></div>;
  }
  return (
    <div className="fc-wrap">
      <div className="fc-header">
        <span className="fc-info">Bees: {state.popped}</span>
        <span className="fc-timer">{state.ticksRemaining}s</span>
        <span className="fc-score">{state.score} pts</span>
      </div>
      <div className="fc-board">
        {state.targets.map(p=>{
          const x=(p.lane+0.5)/LANES*100;
          const y=20+((p.ticksLeft*23)%70);
          return (
            <button key={p.id} className="fc-target"
              style={{ left:`${x}%`, top:`${y}%`, transform:"translate(-50%,-50%)", background:"transparent", border:"none" }}
              onClick={()=>dispatch({type:"pop",id:p.id} as BeeBuzzAction)} aria-label="bees">🐝</button>
          );
        })}
      </div>
    </div>
  );
}
