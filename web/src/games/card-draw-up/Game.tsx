import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { CardDrawUpState, CardDrawUpAction, CardDrawUpSettings } from "./state.js";
import { cardLabel, isRed, isTerminal } from "./state.js";
import "./Game.css";

export function CardDrawUp({ state, dispatch, onGameOver }: GameProps<CardDrawUpState, CardDrawUpSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);
  if (state.phase === "gameover") return <div className="ctf-wrap"><div className="ctf-done"><h2>Done!</h2><p>Total: {state.coins} pts</p></div></div>;
  return (
    <div className="ctf-wrap">
      <div className="ctf-header"><span>Round {state.round} / {state.maxRounds}</span><span className="ctf-score">{state.coins} pts</span></div>
      <div style={{fontSize:"1.5rem",fontWeight:900,color:state.total>21?"#e74c3c":state.total>=18?"#27ae60":"#2c3e50"}}>Total: {state.total}</div>
      <div className="ctf-cards" style={{flexWrap:"wrap",justifyContent:"center",gap:"6px"}}>
        {state.drawn.map((c, i) => <div key={i} className={`ctf-card ${isRed(c)?"red":""}`} style={{width:"52px",height:"72px",fontSize:"1rem"}}>{cardLabel(c)}</div>)}
      </div>
      {state.phase === "result" && <p className="ctf-msg" style={{color:state.bust?"#e74c3c":"#27ae60"}}>{state.bust ? `Bust! (${state.total}) — 0 pts` : `Stopped at ${state.total} — +${state.lastGain} pts`}</p>}
      <div className="ctf-actions">
        {state.phase === "drawing" && <>
          <button className="ctf-btn" onClick={()=>dispatch({type:"draw"} as CardDrawUpAction)}>Draw</button>
          {state.drawn.length > 0 && <button className="ctf-btn" style={{background:"#27ae60"}} onClick={()=>dispatch({type:"stop"} as CardDrawUpAction)}>Stop</button>}
        </>}
        {state.phase === "result" && <button className="ctf-btn" onClick={()=>dispatch({type:"next"} as CardDrawUpAction)}>{state.round>=state.maxRounds?"Finish":"Next"}</button>}
      </div>
    </div>
  );
}
