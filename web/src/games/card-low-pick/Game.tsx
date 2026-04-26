import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { CardLowPickState, CardLowPickAction, CardLowPickSettings } from "./state.js";
import { isTerminal, rankName, suitName } from "./state.js";
import "./Game.css";

export function CardLowPickGame({ state, dispatch, onGameOver }: GameProps<CardLowPickState, CardLowPickSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);
  if (state.phase === "gameover") return <div className="cm-wrap"><div className="cm-done"><h2>Done!</h2><p>Score: {state.score}</p></div></div>;
  return (
    <div className="cm-wrap">
      <div className="cm-header"><span>Round {state.round}/{state.maxRounds}</span><span className="cm-score">{state.score} pts</span></div>
      <p>Pick the LOWEST ranked card!</p>
      <div className="cm-cards">
        {state.hand.map((c, i) => {
          const isPickable = state.phase === "picking";
          const red = Math.floor(c/13)===1||Math.floor(c/13)===2;
          return <div key={i} className={`cm-card ${red?"red":""} ${!isPickable?"disabled":""}`} onClick={() => isPickable && dispatch({ type:"pick", index:i } as CardLowPickAction)}>{rankName(c)}{suitName(c)}</div>;
        })}
      </div>
      {state.phase === "result" && <>
        <div className="cm-result">+{state.lastPts} pts</div>
        <button className="cm-btn" onClick={() => dispatch({ type:"next" } as CardLowPickAction)}>{state.round >= state.maxRounds ? "Finish" : "Next"}</button>
      </>}
    </div>
  );
}
