import { useState, useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DiceAddBetState, DiceAddBetAction, DiceAddBetSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";
const FACES = ["","⚀","⚁","⚂","⚃","⚄","⚅"];
export function DiceAddBet({ state, dispatch, onGameOver }: GameProps<DiceAddBetState, DiceAddBetSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);
  const [bet, setBet] = useState(10);
  if (state.phase === "gameover") return <div className="dg-wrap"><div className="dg-done"><h2>Done!</h2><p>Coins: {state.coins}</p></div></div>;
  const sum = state.dice ? state.dice[0]+state.dice[1]+state.dice[2] : 0;
  return (
    <div className="dg-wrap">
      <div className="dg-header"><span>Round {state.round}/{state.maxRounds}</span><span className="dg-score">{state.coins} coins</span></div>
      <div className="dg-dice">{state.dice ? state.dice.map((d,i)=><div key={i} className="dg-die">{FACES[d]}</div>) : [1,2,3].map(i=><div key={i} className="dg-die" style={{opacity:0.3}}>?</div>)}</div>
      {state.phase==="result" && <p className={`dg-msg${state.lastWin?"":" bad"}`}>{state.lastWin?`Won! Sum=${sum} — +${state.bet} coins`:`Lost! Sum=${sum} — -${state.bet} coins`}</p>}
      {state.phase==="betting" && <>
        <label className="dg-label">Bet: <input type="number" min={1} max={state.coins} value={bet} onChange={e=>setBet(Math.max(1,parseInt(e.target.value)||1))} style={{width:"60px",textAlign:"center"}}/></label>
        <div style={{display:"flex",gap:"12px"}}>
          <button className="dg-btn green" onClick={()=>dispatch({type:"bet",amount:bet,side:"hi"} as DiceAddBetAction)}>High (&gt;10)</button>
          <button className="dg-btn red" onClick={()=>dispatch({type:"bet",amount:bet,side:"lo"} as DiceAddBetAction)}>Low (≤10)</button>
        </div>
      </>}
      {state.phase==="result" && <button className="dg-btn" onClick={()=>dispatch({type:"next"} as DiceAddBetAction)}>{state.round>=state.maxRounds?"Finish":"Next"}</button>}
    </div>
  );
}
