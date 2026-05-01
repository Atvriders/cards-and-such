import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { ChineseBlackjackCasState, ChineseBlackjackCasAction, ChineseBlackjackCasSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS, cardName, isRed } from "./state.js";
import "./Game.css";

const SURRENDER_ENABLED = false;
export function ChineseBlackjackCasGame({ state, dispatch, onGameOver }: GameProps<ChineseBlackjackCasState, ChineseBlackjackCasSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") return <div className="cn-bj-c-wrap"><div className="cn-bj-c-done"><h2>Done!</h2><div className="cn-bj-c-final">{state.score} pts</div></div></div>;
  const showDealer = state.phase !== "play";
  return (
    <div className="cn-bj-c-wrap">
      <div className="cn-bj-c-title">Chinese Blackjack</div>
      <div className="cn-bj-c-info">Round {state.round} / {TOTAL_ROUNDS}</div>
      <div className="cn-bj-c-score">{state.score} pts</div>
      <div className="cn-bj-c-info">Dealer ({showDealer ? state.dealerTotal : "?"}):</div>
      <div className="cn-bj-c-row">
        {state.dealer.map((c, i) => (i === 1 && !showDealer)
          ? <div key={i} className="cn-bj-c-card back">??</div>
          : <div key={i} className={`cn-bj-c-card ${isRed(c) ? "red" : "black"}`}>{cardName(c)}</div>)}
      </div>
      <div className="cn-bj-c-info">You ({state.yourTotal}):</div>
      <div className="cn-bj-c-row">{state.you.map((c, i) => <div key={i} className={`cn-bj-c-card ${isRed(c) ? "red" : "black"}`}>{cardName(c)}</div>)}</div>
      {state.phase === "play" && <div className="cn-bj-c-actions">
        <button className="cn-bj-c-btn" onClick={() => dispatch({ type: "hit" } as ChineseBlackjackCasAction)}>Hit</button>
        <button className="cn-bj-c-btn alt" onClick={() => dispatch({ type: "stand" } as ChineseBlackjackCasAction)}>Stand</button>
        {state.you.length === 2 && <button className="cn-bj-c-btn alt" onClick={() => dispatch({ type: "double" } as ChineseBlackjackCasAction)}>Double</button>}
        {SURRENDER_ENABLED && state.you.length === 2 && <button className="cn-bj-c-btn alt" onClick={() => dispatch({ type: "surrender" } as ChineseBlackjackCasAction)}>Surrender</button>}
      </div>}
      {state.phase === "scored" && <>
        <div className="cn-bj-c-result">{state.result} — +{state.pts}</div>
        <button className="cn-bj-c-btn alt" onClick={() => dispatch({ type: "next" } as ChineseBlackjackCasAction)}>Next</button>
      </>}
    </div>
  );
}
