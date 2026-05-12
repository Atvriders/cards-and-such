import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { CardPickThreeState, CardPickThreeAction, CardPickThreeSettings } from "./state.js";
import { cardLabel, isRed, isTerminal } from "./state.js";
import "./Game.css";

export function CardPickThree({ state, dispatch, onGameOver }: GameProps<CardPickThreeState, CardPickThreeSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);
  if (state.phase === "gameover") return <div className="ctf-wrap"><div className="ctf-done bounce-in"><h2>Done!</h2><p>Total: {state.coins} pts</p></div></div>;
  return (
    <div className="ctf-wrap fade-in">
      <div className="ctf-header"><span>Round {state.round} / {state.maxRounds}</span><span className="ctf-score">{state.coins} pts</span></div>
      {state.phase === "picking" && <p style={{color:"#555",fontSize:"0.9rem"}}>Pick 3 of 5 cards ({state.picked.length}/3 selected)</p>}
      <div className="ctf-cards" style={{flexWrap:"wrap",justifyContent:"center"}}>
        {state.hand.map((c, i) => {
          const shown = state.phase === "result" || state.picked.includes(i);
          const sel = state.picked.includes(i);
          return <div key={i} className={`ctf-card ${shown&&isRed(c)?"red":""} ${sel?"selected-card":""} ${state.phase==="picking"&&!sel?"back":""}`}
            style={{cursor:state.phase==="picking"?"pointer":"default",outline:sel?"3px solid #27ae60":"none"}}
            onClick={() => state.phase==="picking" && dispatch({type:"pick",index:i} as CardPickThreeAction)}>
            {shown ? cardLabel(c) : "?"}
          </div>;
        })}
      </div>
      {state.phase === "result" && <p className="ctf-msg">+{state.lastScore} pts!</p>}
      <div className="ctf-actions">
        {state.phase === "picking" && <button data-testid="hint-target-card-pick-three-primary" className="ctf-btn" disabled={state.picked.length!==3} onClick={()=>dispatch({type:"confirm"} as CardPickThreeAction)}>Confirm Pick</button>}
        {state.phase === "result" && <button className="ctf-btn" onClick={()=>dispatch({type:"next"} as CardPickThreeAction)}>{state.round>=state.maxRounds?"Finish":"Next"}</button>}
      </div>
    </div>
  );
}
