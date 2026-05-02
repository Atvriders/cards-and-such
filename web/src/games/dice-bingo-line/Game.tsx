import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DiceBingoLineState, DiceBingoLineAction, DiceBingoLineSettings } from "./state.js";
import { isTerminal, TOTAL_ROLLS } from "./state.js";
import "./Game.css";
export function DiceBingoLineGame({ state, dispatch, onGameOver }: GameProps<DiceBingoLineState, DiceBingoLineSettings>): JSX.Element {
  const t=isTerminal(state);
  useEffect(()=>{ if(t) onGameOver(t.score); },[t,onGameOver]);
  if (state.phase==="done") return <div className="dm-wrap"><div className="dm-done"><h2>Done!</h2><p>{state.bingo?"BINGO!":"Time's up"}</p><div className="dm-final">{state.score} pts</div></div></div>;
  return (
    <div className="dm-wrap">
      <div className="dm-info">Roll {state.rolls} / {TOTAL_ROLLS}</div>
      <div className="dm-score">{state.score} pts</div>
      {state.lastRoll!==null && <div className="dm-die">{state.lastRoll}</div>}
      <div className="dm-row">
        {state.line.map((filled,i)=>(<div key={i} className={`dm-cell ${filled?"filled":""}`}>{i+1}</div>))}
      </div>
      <button data-testid="hint-target-dice-bingo-line-roll" className="dm-btn" onClick={()=>dispatch({type:"roll"} as DiceBingoLineAction)}>Roll</button>
    </div>
  );
}
