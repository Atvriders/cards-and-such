import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { AtlanticCityBjCasState, AtlanticCityBjCasAction, AtlanticCityBjCasSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS, cardName, isRed } from "./state.js";
import "./Game.css";

const SURRENDER_ENABLED = true;
export function AtlanticCityBjCasGame({ state, dispatch, onGameOver }: GameProps<AtlanticCityBjCasState, AtlanticCityBjCasSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") return <div className="ac-bj-c-wrap"><div className="ac-bj-c-done"><h2>Done!</h2><div className="ac-bj-c-final">{state.score} pts</div></div></div>;
  const showDealer = state.phase !== "play";
  return (
    <div className="ac-bj-c-wrap">
      <div className="ac-bj-c-title">Atlantic City Blackjack</div>
      <div className="ac-bj-c-info">Round {state.round} / {TOTAL_ROUNDS}</div>
      <div className="ac-bj-c-score">{state.score} pts</div>
      <div className="ac-bj-c-info">Dealer ({showDealer ? state.dealerTotal : "?"}):</div>
      <div className="ac-bj-c-row">
        {state.dealer.map((c, i) => (i === 1 && !showDealer)
          ? <div key={i} className="ac-bj-c-card back">??</div>
          : <div key={i} className={`ac-bj-c-card ${isRed(c) ? "red" : "black"}`}>{cardName(c)}</div>)}
      </div>
      <div className="ac-bj-c-info">You ({state.yourTotal}):</div>
      <div className="ac-bj-c-row">{state.you.map((c, i) => <div key={i} className={`ac-bj-c-card ${isRed(c) ? "red" : "black"}`}>{cardName(c)}</div>)}</div>
      {state.phase === "play" && <div className="ac-bj-c-actions">
        <button className="ac-bj-c-btn" onClick={() => dispatch({ type: "hit" } as AtlanticCityBjCasAction)}>Hit</button>
        <button className="ac-bj-c-btn alt" onClick={() => dispatch({ type: "stand" } as AtlanticCityBjCasAction)}>Stand</button>
        {state.you.length === 2 && <button className="ac-bj-c-btn alt" onClick={() => dispatch({ type: "double" } as AtlanticCityBjCasAction)}>Double</button>}
        {SURRENDER_ENABLED && state.you.length === 2 && <button className="ac-bj-c-btn alt" onClick={() => dispatch({ type: "surrender" } as AtlanticCityBjCasAction)}>Surrender</button>}
      </div>}
      {state.phase === "scored" && <>
        <div className="ac-bj-c-result">{state.result} — +{state.pts}</div>
        <button className="ac-bj-c-btn alt" onClick={() => dispatch({ type: "next" } as AtlanticCityBjCasAction)}>Next</button>
      </>}
    </div>
  );
}
