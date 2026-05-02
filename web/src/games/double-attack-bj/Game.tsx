import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DoubleAttackBjState, DoubleAttackBjAction, DoubleAttackBjSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS, cardName, isRed } from "./state.js";
import "./Game.css";

const SURRENDER_ENABLED = true;
export function DoubleAttackBjGame({ state, dispatch, onGameOver }: GameProps<DoubleAttackBjState, DoubleAttackBjSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") return <div className="da-bj-wrap"><div className="da-bj-done"><h2>Done!</h2><div className="da-bj-final">{state.score} pts</div></div></div>;
  const showDealer = state.phase !== "play";
  return (
    <div className="da-bj-wrap">
      <div className="da-bj-title">Double Attack Blackjack</div>
      <div className="da-bj-info">Round {state.round} / {TOTAL_ROUNDS}</div>
      <div className="da-bj-score">{state.score} pts</div>
      <div className="da-bj-info">Dealer ({showDealer ? state.dealerTotal : "?"}):</div>
      <div className="da-bj-row">
        {state.dealer.map((c, i) => (i === 1 && !showDealer)
          ? <div key={i} className="da-bj-card back">??</div>
          : <div key={i} className={`da-bj-card ${isRed(c) ? "red" : "black"}`}>{cardName(c)}</div>)}
      </div>
      <div className="da-bj-info">You ({state.yourTotal}):</div>
      <div className="da-bj-row">{state.you.map((c, i) => <div key={i} className={`da-bj-card ${isRed(c) ? "red" : "black"}`}>{cardName(c)}</div>)}</div>
      {state.phase === "play" && <div className="da-bj-actions">
        <button data-testid="hint-target-double-attack-bj-hit" className="da-bj-btn" onClick={() => dispatch({ type: "hit" } as DoubleAttackBjAction)}>Hit</button>
        <button data-testid="hint-target-double-attack-bj-stand" className="da-bj-btn alt" onClick={() => dispatch({ type: "stand" } as DoubleAttackBjAction)}>Stand</button>
        {state.you.length === 2 && <button className="da-bj-btn alt" onClick={() => dispatch({ type: "double" } as DoubleAttackBjAction)}>Double</button>}
        {SURRENDER_ENABLED && state.you.length === 2 && <button className="da-bj-btn alt" onClick={() => dispatch({ type: "surrender" } as DoubleAttackBjAction)}>Surrender</button>}
      </div>}
      {state.phase === "scored" && <>
        <div className="da-bj-result">{state.result} — +{state.pts}</div>
        <button data-testid="hint-target-double-attack-bj-next" className="da-bj-btn alt" onClick={() => dispatch({ type: "next" } as DoubleAttackBjAction)}>Next</button>
      </>}
    </div>
  );
}
