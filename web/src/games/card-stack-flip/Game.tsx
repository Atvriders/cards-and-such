import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { CardStackFlipState, CardStackFlipAction, CardStackFlipSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

export function CardStackFlipGame({ state, dispatch, onGameOver }: GameProps<CardStackFlipState, CardStackFlipSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);
  if (state.phase === "gameover") return <div className="cm-wrap"><div className="cm-done"><h2>Done!</h2><p>Total: {state.score} pts</p></div></div>;
  return (
    <div className="cm-wrap">
      <div className="cm-header"><span>Round {state.round}/{state.maxRounds}</span><span className="cm-score">{state.score} pts</span></div>
      <div className="cm-cards">
        {state.phase === "revealed" ? state.flipped.map((c,i) => <div key={i} className={`cm-card ${Math.floor(c/13)===1||Math.floor(c/13)===2?"red":""}`}>{["2","3","4","5","6","7","8","9","10","J","Q","K","A"][c%13]}{"♠♥♦♣"[Math.floor(c/13)]}</div>) : [0,1,2,3,4].map(i => <div key={i} className="cm-card">?</div>)}
      </div>
      {state.phase === "revealed" && <div className="cm-result">+{state.lastPts} pts</div>}
      {state.phase === "waiting" && <button className="cm-btn" onClick={() => dispatch({ type:"flip" } as CardStackFlipAction)}>Flip 5</button>}
      {state.phase === "revealed" && <button className="cm-btn" onClick={() => dispatch({ type:"next" } as CardStackFlipAction)}>{state.round >= state.maxRounds ? "Finish" : "Next"}</button>}
    </div>
  );
}
