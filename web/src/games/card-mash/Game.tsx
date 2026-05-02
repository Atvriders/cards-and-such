import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { CardMashState, CardMashAction, CardMashSettings } from "./state.js";
import { isTerminal, cardName, isRed, suitOf, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";
const SUITS = ["Spades \u2660","Hearts \u2665","Diamonds \u2666","Clubs \u2663"];
export function CardMashGame({ state, dispatch, onGameOver }: GameProps<CardMashState, CardMashSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") return <div className="cm-wrap"><div className="cm-done"><h2>Done!</h2><div className="cm-final">{state.score} pts</div></div></div>;
  return (
    <div className="cm-wrap">
      <div className="cm-info">Round {state.round} / {TOTAL_ROUNDS}</div>
      <div className="cm-score">{state.score} pts</div>
      {state.phase === "scored" && <div className="cm-info">Target: <b>{SUITS[state.targetSuit]}</b></div>}
      {state.hand.length > 0 && (<div className="cm-row">{state.hand.map((c,i)=><div key={i} className={`cm-card ${isRed(c)?"red":"black"} ${suitOf(c)===state.targetSuit?"hl":""}`}>{cardName(c)}</div>)}</div>)}
      {state.phase === "dealing" && <button data-testid="hint-target-card-mash-primary" className="cm-btn" onClick={() => dispatch({ type:"deal" } as CardMashAction)}>Deal 5</button>}
      {state.phase === "scored" && (<><div className="cm-result">Matches: {state.matches} - +{state.lastPts}</div><button className="cm-btn alt" onClick={() => dispatch({ type:"next" } as CardMashAction)}>{state.round >= TOTAL_ROUNDS ? "Finish" : "Next"}</button></>)}
    </div>
  );
}
