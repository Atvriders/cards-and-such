import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { EuropeanBjCasState, EuropeanBjCasAction, EuropeanBjCasSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS, cardName, isRed } from "./state.js";
import "./Game.css";

const SURRENDER_ENABLED = false;
export function EuropeanBjCasGame({ state, dispatch, onGameOver }: GameProps<EuropeanBjCasState, EuropeanBjCasSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") return <div className="eu-bj-c-wrap"><div className="eu-bj-c-done"><h2>Done!</h2><div className="eu-bj-c-final">{state.score} pts</div></div></div>;
  const showDealer = state.phase !== "play";
  return (
    <div className="eu-bj-c-wrap">
      <div className="eu-bj-c-title">European Blackjack</div>
      <div className="eu-bj-c-info">Round {state.round} / {TOTAL_ROUNDS}</div>
      <div className="eu-bj-c-score">{state.score} pts</div>
      <div className="eu-bj-c-info">Dealer ({showDealer ? state.dealerTotal : "?"}):</div>
      <div className="eu-bj-c-row">
        {state.dealer.map((c, i) => (i === 1 && !showDealer)
          ? <div key={i} className="eu-bj-c-card back">??</div>
          : <div key={i} className={`eu-bj-c-card ${isRed(c) ? "red" : "black"}`}>{cardName(c)}</div>)}
      </div>
      <div className="eu-bj-c-info">You ({state.yourTotal}):</div>
      <div className="eu-bj-c-row">{state.you.map((c, i) => <div key={i} className={`eu-bj-c-card ${isRed(c) ? "red" : "black"}`}>{cardName(c)}</div>)}</div>
      {state.phase === "play" && <div className="eu-bj-c-actions">
        <button data-testid="hint-target-european-bj-cas-hit" data-testid="hint-target-european-bj-cas-primary" className="eu-bj-c-btn" onClick={() => dispatch({ type: "hit" } as EuropeanBjCasAction)}>Hit</button>
        <button data-testid="hint-target-european-bj-cas-stand" className="eu-bj-c-btn alt" onClick={() => dispatch({ type: "stand" } as EuropeanBjCasAction)}>Stand</button>
        {state.you.length === 2 && <button className="eu-bj-c-btn alt" onClick={() => dispatch({ type: "double" } as EuropeanBjCasAction)}>Double</button>}
        {SURRENDER_ENABLED && state.you.length === 2 && <button className="eu-bj-c-btn alt" onClick={() => dispatch({ type: "surrender" } as EuropeanBjCasAction)}>Surrender</button>}
      </div>}
      {state.phase === "scored" && <>
        <div className="eu-bj-c-result">{state.result} — +{state.pts}</div>
        <button data-testid="hint-target-european-bj-cas-next" className="eu-bj-c-btn alt" onClick={() => dispatch({ type: "next" } as EuropeanBjCasAction)}>Next</button>
      </>}
    </div>
  );
}
