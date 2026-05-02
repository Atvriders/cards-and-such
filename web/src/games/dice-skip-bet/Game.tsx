import { useState, useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DiceSkipBetState, DiceSkipBetAction, DiceSkipBetSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";
const FACES = ["","⚀","⚁","⚂","⚃","⚄","⚅"];
export function DiceSkipBet({ state, dispatch, onGameOver }: GameProps<DiceSkipBetState, DiceSkipBetSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);
  const [bet, setBet] = useState(10);
  const [skip, setSkip] = useState(6);
  if (state.phase === "gameover") return <div className="dg-wrap"><div className="dg-done"><h2>Done!</h2><p>Coins: {state.coins}</p></div></div>;
  return (
    <div className="dg-wrap">
      <div className="dg-header"><span>Round {state.round}/{state.maxRounds}</span><span className="dg-score">{state.coins} coins</span></div>
      <p className="dg-label">Pick a "skip" number. Hit it = lose 5× bet. Miss it = win bet.</p>
      <div className="dg-dice">{state.die ? <div className={`dg-die${state.lastWin===false?" "+(state.skipNumber===state.die?"":""):""}`} style={{borderColor:state.lastWin===false?"#e74c3c":"#27ae60"}}>{FACES[state.die]}</div> : <div className="dg-die" style={{opacity:0.3}}>?</div>}</div>
      {state.phase==="result" && <p className={`dg-msg${state.lastWin?"":" bad"}`}>{state.lastWin?`Rolled ${state.die} — not ${state.skipNumber}! +${state.bet} coins`:`Hit ${state.skipNumber}! Lost ${state.bet*5} coins`}</p>}
      {state.phase==="betting" && <>
        <div style={{display:"flex",gap:"16px",alignItems:"center"}}>
          <label className="dg-label">Skip #: <select value={skip} onChange={e=>setSkip(parseInt(e.target.value))} style={{marginLeft:"4px"}}>{[1,2,3,4,5,6].map(n=><option key={n}>{n}</option>)}</select></label>
          <label className="dg-label">Bet: <input type="number" min={1} max={state.coins} value={bet} onChange={e=>setBet(Math.max(1,parseInt(e.target.value)||1))} style={{width:"55px",textAlign:"center"}}/></label>
        </div>
        <button data-testid="hint-target-dice-skip-bet-roll" className="dg-btn" onClick={()=>dispatch({type:"bet",amount:bet,skip} as DiceSkipBetAction)}>Roll!</button>
      </>}
      {state.phase==="result" && <button className="dg-btn" onClick={()=>dispatch({type:"next"} as DiceSkipBetAction)}>{state.round>=state.maxRounds?"Finish":"Next"}</button>}
    </div>
  );
}
