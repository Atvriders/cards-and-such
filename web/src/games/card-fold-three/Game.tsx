import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { CardFoldThreeState, CardFoldThreeAction, CardFoldThreeSettings } from "./state.js";
import { cardLabel, isRed, isTerminal } from "./state.js";
import "./Game.css";

export function CardFoldThree({ state, dispatch, onGameOver }: GameProps<CardFoldThreeState, CardFoldThreeSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);
  if (state.phase === "gameover") return <div className="ctf-wrap"><div className="ctf-done"><h2>Done!</h2><p>Total: {state.coins} pts</p></div></div>;
  return (
    <div className="ctf-wrap">
      <div className="ctf-header"><span>Round {state.round} / {state.maxRounds}</span><span className="ctf-score">{state.coins} pts</span></div>
      <div className="ctf-cards">
        {state.hand.map((c, i) => <div key={i} className={`ctf-card ${isRed(c)?"red":""}`}>{cardLabel(c)}</div>)}
      </div>
      {state.phase === "result" && <p className="ctf-msg">{state.choice === "fold" ? `Folded — scored lowest: +${state.lastScore} pts` : `Stood — scored highest: +${state.lastScore} pts`}</p>}
      <div className="ctf-actions">
        {state.phase === "decide" && <>
          <button data-testid="hint-target-card-fold-three-fold" className="ctf-btn" style={{background:"#e74c3c"}} onClick={()=>dispatch({type:"fold"} as CardFoldThreeAction)}>Fold (score lowest)</button>
          <button data-testid="hint-target-card-fold-three-stand" className="ctf-btn" onClick={()=>dispatch({type:"stand"} as CardFoldThreeAction)}>Stand (score highest)</button>
        </>}
        {state.phase === "result" && <button data-testid="hint-target-card-fold-three-next" className="ctf-btn" onClick={()=>dispatch({type:"next"} as CardFoldThreeAction)}>{state.round>=state.maxRounds?"Finish":"Next"}</button>}
      </div>
    </div>
  );
}
