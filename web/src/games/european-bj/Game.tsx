import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { EuropeanBjState, EuropeanBjAction, EuropeanBjSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS, cardName, isRed } from "./state.js";
import "./Game.css";

const SURRENDER_ENABLED = false;
export function EuropeanBjGame({ state, dispatch, onGameOver }: GameProps<EuropeanBjState, EuropeanBjSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") return <div className="eu-bj-wrap"><div className="eu-bj-done"><h2>Done!</h2><div className="eu-bj-final">{state.score} pts</div></div></div>;
  const showDealer = state.phase !== "play";
  return (
    <div className="eu-bj-wrap">
      <div className="eu-bj-title">European Blackjack</div>
      <div className="eu-bj-info">Round {state.round} / {TOTAL_ROUNDS}</div>
      <div className="eu-bj-score">{state.score} pts</div>
      <div className="eu-bj-info">Dealer ({showDealer ? state.dealerTotal : "?"}):</div>
      <div className="eu-bj-row">
        {state.dealer.map((c, i) => (i === 1 && !showDealer)
          ? <div key={i} className="eu-bj-card back">??</div>
          : <div key={i} className={`eu-bj-card ${isRed(c) ? "red" : "black"}`}>{cardName(c)}</div>)}
      </div>
      <div className="eu-bj-info">You ({state.yourTotal}):</div>
      <div className="eu-bj-row">{state.you.map((c, i) => <div key={i} className={`eu-bj-card ${isRed(c) ? "red" : "black"}`}>{cardName(c)}</div>)}</div>
      {state.phase === "play" && <div className="eu-bj-actions">
        <button data-testid="hint-target-european-bj-hit" className="eu-bj-btn" onClick={() => dispatch({ type: "hit" } as EuropeanBjAction)}>Hit</button>
        <button data-testid="hint-target-european-bj-stand" className="eu-bj-btn alt" onClick={() => dispatch({ type: "stand" } as EuropeanBjAction)}>Stand</button>
        {state.you.length === 2 && <button className="eu-bj-btn alt" onClick={() => dispatch({ type: "double" } as EuropeanBjAction)}>Double</button>}
        {SURRENDER_ENABLED && state.you.length === 2 && <button className="eu-bj-btn alt" onClick={() => dispatch({ type: "surrender" } as EuropeanBjAction)}>Surrender</button>}
      </div>}
      {state.phase === "scored" && <>
        <div className="eu-bj-result">{state.result} — +{state.pts}</div>
        <button data-testid="hint-target-european-bj-next" className="eu-bj-btn alt" onClick={() => dispatch({ type: "next" } as EuropeanBjAction)}>Next</button>
      </>}
    </div>
  );
}
