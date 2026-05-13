import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DiceStepBetState, DiceStepBetAction, DiceStepBetSettings } from "./state.js";
import { isTerminal } from "./state.js";
import { Die } from "../../engines/dice/Die.js";
import "./Game.css";
export function DiceStepBet({ state, dispatch, onGameOver }: GameProps<DiceStepBetState, DiceStepBetSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);
  if (state.phase === "gameover") return <div className="dg-wrap"><div className="dg-done"><h2>Done!</h2><p>Total: {state.coins} pts</p></div></div>;
  return (
    <div className="dg-wrap">
      <div className="dg-header"><span>Round {state.round}/{state.maxRounds}</span><span className="dg-score">{state.coins} pts</span></div>
      <div style={{fontSize:"1.6rem",fontWeight:900,color:state.runTotal>21?"#e74c3c":state.runTotal>=15?"#f39c12":"#2c3e50"}}>Total: {state.runTotal} / 21</div>
      <div className="dg-dice" style={{flexWrap:"wrap",gap:"6px",justifyContent:"center"}}>
        {state.dieHistory.map((d,i)=><div key={i} className="dg-die" style={{width:"48px",height:"48px",fontSize:"1.4rem"}}><Die value={d as 1 | 2 | 3 | 4 | 5 | 6} /></div>)}
      </div>
      {state.phase==="result" && <p className={`dg-msg${state.bust?" bad":""}`}>{state.bust?`Bust at ${state.runTotal}! +0 pts`:`Banked ${state.lastBank} pts!`}</p>}
      <div style={{display:"flex",gap:"12px"}}>
        {state.phase==="stepping" && <>
          <button className="dg-btn" data-testid="hint-target-dice-step-bet-roll" onClick={()=>dispatch({type:"step"} as DiceStepBetAction)}>Roll</button>
          {state.runTotal>0 && <button className="dg-btn green" data-testid="hint-target-dice-step-bet-bank" onClick={()=>dispatch({type:"bank"} as DiceStepBetAction)}>Bank {state.runTotal}</button>}
        </>}
        {state.phase==="result" && <button className="dg-btn" data-testid="hint-target-dice-step-bet-next" onClick={()=>dispatch({type:"next"} as DiceStepBetAction)}>{state.round>=state.maxRounds?"Finish":"Next Round"}</button>}
      </div>
    </div>
  );
}
