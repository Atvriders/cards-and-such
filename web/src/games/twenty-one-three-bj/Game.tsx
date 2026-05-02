import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { TwentyOneThreeBjState, TwentyOneThreeBjAction, TwentyOneThreeBjSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS, cardName, isRed } from "./state.js";
import "./Game.css";

const SURRENDER_ENABLED = false;
export function TwentyOneThreeBjGame({ state, dispatch, onGameOver }: GameProps<TwentyOneThreeBjState, TwentyOneThreeBjSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") return <div className="tot-bj-wrap"><div className="tot-bj-done"><h2>Done!</h2><div className="tot-bj-final">{state.score} pts</div></div></div>;
  const showDealer = state.phase !== "play";
  return (
    <div className="tot-bj-wrap">
      <div className="tot-bj-title">21+3 Blackjack</div>
      <div className="tot-bj-info">Round {state.round} / {TOTAL_ROUNDS}</div>
      <div className="tot-bj-score">{state.score} pts</div>
      <div className="tot-bj-info">Dealer ({showDealer ? state.dealerTotal : "?"}):</div>
      <div className="tot-bj-row">
        {state.dealer.map((c, i) => (i === 1 && !showDealer)
          ? <div key={i} className="tot-bj-card back">??</div>
          : <div key={i} className={`tot-bj-card ${isRed(c) ? "red" : "black"}`}>{cardName(c)}</div>)}
      </div>
      <div className="tot-bj-info">You ({state.yourTotal}):</div>
      <div className="tot-bj-row">{state.you.map((c, i) => <div key={i} className={`tot-bj-card ${isRed(c) ? "red" : "black"}`}>{cardName(c)}</div>)}</div>
      {state.phase === "play" && <div className="tot-bj-actions">
        <button data-testid="hint-target-twenty-one-three-bj-hit" className="tot-bj-btn" onClick={() => dispatch({ type: "hit" } as TwentyOneThreeBjAction)}>Hit</button>
        <button data-testid="hint-target-twenty-one-three-bj-stand" className="tot-bj-btn alt" onClick={() => dispatch({ type: "stand" } as TwentyOneThreeBjAction)}>Stand</button>
        {state.you.length === 2 && <button className="tot-bj-btn alt" onClick={() => dispatch({ type: "double" } as TwentyOneThreeBjAction)}>Double</button>}
        {SURRENDER_ENABLED && state.you.length === 2 && <button className="tot-bj-btn alt" onClick={() => dispatch({ type: "surrender" } as TwentyOneThreeBjAction)}>Surrender</button>}
      </div>}
      {state.phase === "scored" && <>
        <div className="tot-bj-result">{state.result} — +{state.pts}</div>
        <button data-testid="hint-target-twenty-one-three-bj-next" className="tot-bj-btn alt" onClick={() => dispatch({ type: "next" } as TwentyOneThreeBjAction)}>Next</button>
      </>}
    </div>
  );
}
