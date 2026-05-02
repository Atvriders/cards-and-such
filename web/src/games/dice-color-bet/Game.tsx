import { useState, useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DiceColorBetState, DiceColorBetAction, DiceColorBetSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";
const FACES = ["","⚀","⚁","⚂","⚃","⚄","⚅"];
export function DiceColorBet({ state, dispatch, onGameOver }: GameProps<DiceColorBetState, DiceColorBetSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);
  const [bet, setBet] = useState(10);
  if (state.phase === "gameover") return <div className="dg-wrap"><div className="dg-done"><h2>Done!</h2><p>Coins: {state.coins}</p></div></div>;
  const sum = state.dice ? state.dice[0]+state.dice[1] : 0;
  return (
    <div className="dg-wrap">
      <div className="dg-header"><span>Round {state.round}/{state.maxRounds}</span><span className="dg-score">{state.coins} coins</span></div>
      <p className="dg-label">Red = Odd sum | Blue = Even sum</p>
      <div className="dg-dice">{state.dice ? state.dice.map((d,i)=><div key={i} className="dg-die">{FACES[d]}</div>) : [1,2].map(i=><div key={i} className="dg-die" style={{opacity:0.3}}>?</div>)}</div>
      {state.phase==="result" && <p className={`dg-msg${state.lastWin?"":" bad"}`}>{state.lastWin?`Won! Sum=${sum} (${sum%2===1?"odd":"even"}) +${state.bet}`:`Lost! Sum=${sum} -${state.bet}`}</p>}
      {state.phase==="betting" && <>
        <label className="dg-label">Bet: <input type="number" min={1} max={state.coins} value={bet} onChange={e=>setBet(Math.max(1,parseInt(e.target.value)||1))} style={{width:"60px",textAlign:"center"}}/></label>
        <div style={{display:"flex",gap:"12px"}}>
          <button data-testid="hint-target-dice-color-bet-roll" className="dg-btn red" onClick={()=>dispatch({type:"bet",amount:bet,color:"red"} as DiceColorBetAction)}>Red (Odd)</button>
          <button className="dg-btn" style={{background:"#2980b9"}} onClick={()=>dispatch({type:"bet",amount:bet,color:"blue"} as DiceColorBetAction)}>Blue (Even)</button>
        </div>
      </>}
      {state.phase==="result" && <button className="dg-btn" onClick={()=>dispatch({type:"next"} as DiceColorBetAction)}>{state.round>=state.maxRounds?"Finish":"Next"}</button>}
    </div>
  );
}
