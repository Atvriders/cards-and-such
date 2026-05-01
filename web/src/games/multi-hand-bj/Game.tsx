import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { MultiHandBjState, MultiHandBjAction, MultiHandBjSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS, cardName, isRed } from "./state.js";
import "./Game.css";

const SURRENDER_ENABLED = false;
export function MultiHandBjGame({ state, dispatch, onGameOver }: GameProps<MultiHandBjState, MultiHandBjSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") return <div className="mh-bj-wrap"><div className="mh-bj-done"><h2>Done!</h2><div className="mh-bj-final">{state.score} pts</div></div></div>;
  const showDealer = state.phase !== "play";
  return (
    <div className="mh-bj-wrap">
      <div className="mh-bj-title">Multi-Hand Blackjack</div>
      <div className="mh-bj-info">Round {state.round} / {TOTAL_ROUNDS}</div>
      <div className="mh-bj-score">{state.score} pts</div>
      <div className="mh-bj-info">Dealer ({showDealer ? state.dealerTotal : "?"}):</div>
      <div className="mh-bj-row">
        {state.dealer.map((c, i) => (i === 1 && !showDealer)
          ? <div key={i} className="mh-bj-card back">??</div>
          : <div key={i} className={`mh-bj-card ${isRed(c) ? "red" : "black"}`}>{cardName(c)}</div>)}
      </div>
      <div className="mh-bj-info">You ({state.yourTotal}):</div>
      <div className="mh-bj-row">{state.you.map((c, i) => <div key={i} className={`mh-bj-card ${isRed(c) ? "red" : "black"}`}>{cardName(c)}</div>)}</div>
      {state.phase === "play" && <div className="mh-bj-actions">
        <button className="mh-bj-btn" onClick={() => dispatch({ type: "hit" } as MultiHandBjAction)}>Hit</button>
        <button className="mh-bj-btn alt" onClick={() => dispatch({ type: "stand" } as MultiHandBjAction)}>Stand</button>
        {state.you.length === 2 && <button className="mh-bj-btn alt" onClick={() => dispatch({ type: "double" } as MultiHandBjAction)}>Double</button>}
        {SURRENDER_ENABLED && state.you.length === 2 && <button className="mh-bj-btn alt" onClick={() => dispatch({ type: "surrender" } as MultiHandBjAction)}>Surrender</button>}
      </div>}
      {state.phase === "scored" && <>
        <div className="mh-bj-result">{state.result} — +{state.pts}</div>
        <button className="mh-bj-btn alt" onClick={() => dispatch({ type: "next" } as MultiHandBjAction)}>Next</button>
      </>}
    </div>
  );
}
