import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DiceTallyState, DiceTallyAction, DiceTallySettings, Category } from "./state.js";
import { isTerminal, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";
const LABELS: Record<Category,string> = { ones:"Ones (sum 1s)", twos:"Twos (sum 2s)", threes:"Threes (sum 3s)", fours:"Fours (sum 4s)", fives:"Fives (sum 5s)", sixes:"Sixes (sum 6s)", highest:"Highest die", sumAll:"Sum all dice" };
export function DiceTallyGame({ state, dispatch, onGameOver }: GameProps<DiceTallyState, DiceTallySettings>): JSX.Element {
  const t=isTerminal(state);
  useEffect(()=>{ if(t) onGameOver(t.score); },[t,onGameOver]);
  if (state.phase==="done") return <div className="dm-wrap"><div className="dm-done bounce-in"><h2>Done!</h2><div className="dm-final">{state.score} pts</div></div></div>;
  return (
    <div className="dm-wrap fade-in">
      <div className="dm-info">Round {state.round} / {TOTAL_ROUNDS}</div>
      <div className="dm-score pulse">{state.score} pts</div>
      {state.dice.length>0 && (<div className="dm-row">{state.dice.map((d,i)=>(<div key={i} className="dm-die">{d}</div>))}</div>)}
      {state.category && <div className="dm-result">Category: {LABELS[state.category]} — +{state.lastPts}</div>}
      {state.phase==="rolling" && <button data-testid="hint-target-dice-tally-roll" className="dm-btn" onClick={()=>dispatch({type:"roll"} as DiceTallyAction)}>Roll 5 Dice</button>}
      {state.phase==="scored" && <button data-testid="hint-target-dice-tally-next" className="dm-btn alt" onClick={()=>dispatch({type:"next"} as DiceTallyAction)}>{state.round>=TOTAL_ROUNDS?"Finish":"Next"}</button>}
    </div>
  );
}
