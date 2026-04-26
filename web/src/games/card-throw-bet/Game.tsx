import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { CardThrowBetState, CardThrowBetAction, CardThrowBetSettings } from "./state.js";
import { isTerminal, rankName, suitName, isRed } from "./state.js";
import "./Game.css";

export function CardThrowBetGame({ state, dispatch, onGameOver }: GameProps<CardThrowBetState, CardThrowBetSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);
  if (state.phase === "gameover") return <div className="cm-wrap"><div className="cm-done"><h2>Done!</h2><p>Coins: {state.coins}</p></div></div>;
  return (
    <div className="cm-wrap">
      <div className="cm-header"><span>Round {state.round}/{state.maxRounds}</span><span className="cm-score">{state.coins} coins</span></div>
      {state.phase === "betting" && <>
        <p>Will the thrown card be Red or Black?</p>
        <div className="cm-bets">
          {([5,10,20] as const).map(a => <button key={`r${a}`} className="cm-bet-btn" style={{borderColor:"#c0392b"}} onClick={() => dispatch({ type:"bet", amount:a, color:"red" } as CardThrowBetAction)}>Red +{a}</button>)}
          {([5,10,20] as const).map(a => <button key={`b${a}`} className="cm-bet-btn" onClick={() => dispatch({ type:"bet", amount:a, color:"black" } as CardThrowBetAction)}>Black +{a}</button>)}
        </div>
      </>}
      {state.phase === "result" && state.card !== null && <>
        <div className={`cm-card disabled ${isRed(state.card) ? "red" : ""}`}>{rankName(state.card)}{suitName(state.card)}</div>
        <div className="cm-result">{state.lastWin ? "Win!" : "Lose!"}</div>
        <button className="cm-btn" onClick={() => dispatch({ type:"next" } as CardThrowBetAction)}>{state.round >= state.maxRounds ? "Finish" : "Next"}</button>
      </>}
    </div>
  );
}
