import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { CardThreeFlipState, CardThreeFlipAction, CardThreeFlipSettings } from "./state.js";
import { rankName, suitName, isTerminal } from "./state.js";
import "./Game.css";

export function CardThreeFlip({ state, dispatch, onGameOver }: GameProps<CardThreeFlipState, CardThreeFlipSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);
  if (state.phase === "gameover") return <div className="ctf-wrap"><div className="ctf-done"><h2>Done!</h2><p>Total Points: {state.coins}</p></div></div>;
  return (
    <div className="ctf-wrap">
      <div className="ctf-header"><span>Round {state.round} / {state.maxRounds}</span><span className="ctf-score">{state.coins} pts</span></div>
      <div className="ctf-cards">
        {state.phase === "revealed" ? state.flipped.map((c, i) => (
          <div key={i} className={`ctf-card ${Math.floor(c/13)===1||Math.floor(c/13)===2?"red":""}`}>{rankName(c)}{suitName(c)}</div>
        )) : [0,1,2].map(i => <div key={i} className="ctf-card back">?</div>)}
      </div>
      {state.phase === "revealed" && <p className="ctf-msg">+{state.lastScore} pts (best rank: {rankName(state.flipped.reduce((a,b)=>(b%13>a%13?b:a)))})</p>}
      <div className="ctf-actions">
        {state.phase === "waiting" && <button data-testid="hint-target-card-three-flip-primary" className="ctf-btn" onClick={() => dispatch({ type:"flip" } as CardThreeFlipAction)}>Flip 3 Cards</button>}
        {state.phase === "revealed" && <button className="ctf-btn" onClick={() => dispatch({ type:"next" } as CardThreeFlipAction)}>{state.round >= state.maxRounds ? "Finish" : "Next Round"}</button>}
      </div>
    </div>
  );
}
