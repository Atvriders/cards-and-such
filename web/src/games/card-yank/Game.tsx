import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { CardYankState, CardYankAction, CardYankSettings } from "./state.js";
import { isTerminal, cardName, isRed, suitOf, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";
const SUITS = ["Spades \u2660","Hearts \u2665","Diamonds \u2666","Clubs \u2663"];
export function CardYankGame({ state, dispatch, onGameOver }: GameProps<CardYankState, CardYankSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") return <div className="cm-wrap"><div className="cm-done"><h2>Done!</h2><div className="cm-final">{state.score} pts</div></div></div>;
  return (
    <div className="cm-wrap">
      <div className="cm-info">Round {state.round} / {TOTAL_ROUNDS}</div>
      <div className="cm-score">{state.score} pts</div>
      {state.phase === "scored" && <div className="cm-info">Suit: <b>{SUITS[state.targetSuit]}</b></div>}
      {state.hand.length > 0 && (<div className="cm-row">{state.hand.map((c,i)=><div key={i} className={`cm-card ${isRed(c)?"red":"black"} ${suitOf(c)===state.targetSuit?"hl":""}`}>{cardName(c)}</div>)}</div>)}
      {state.phase === "dealing" && <button className="cm-btn" onClick={() => dispatch({ type:"yank" } as CardYankAction)}>Yank!</button>}
      {state.phase === "scored" && (<><div className="cm-result">Yanked: {state.matches} - +{state.lastPts}</div><button className="cm-btn alt" onClick={() => dispatch({ type:"next" } as CardYankAction)}>{state.round >= TOTAL_ROUNDS ? "Finish" : "Next"}</button></>)}
    </div>
  );
}
