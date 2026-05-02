import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { BlackjackSwitchCasState, BlackjackSwitchCasAction, BlackjackSwitchCasSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS, cardName, isRed } from "./state.js";
import "./Game.css";

const SURRENDER_ENABLED = false;
export function BlackjackSwitchCasGame({ state, dispatch, onGameOver }: GameProps<BlackjackSwitchCasState, BlackjackSwitchCasSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") return <div className="bj-sw-c-wrap"><div className="bj-sw-c-done"><h2>Done!</h2><div className="bj-sw-c-final">{state.score} pts</div></div></div>;
  const showDealer = state.phase !== "play";
  return (
    <div className="bj-sw-c-wrap">
      <div className="bj-sw-c-title">Blackjack Switch</div>
      <div className="bj-sw-c-info">Round {state.round} / {TOTAL_ROUNDS}</div>
      <div className="bj-sw-c-score">{state.score} pts</div>
      <div className="bj-sw-c-info">Dealer ({showDealer ? state.dealerTotal : "?"}):</div>
      <div className="bj-sw-c-row">
        {state.dealer.map((c, i) => (i === 1 && !showDealer)
          ? <div key={i} className="bj-sw-c-card back">??</div>
          : <div key={i} className={`bj-sw-c-card ${isRed(c) ? "red" : "black"}`}>{cardName(c)}</div>)}
      </div>
      <div className="bj-sw-c-info">You ({state.yourTotal}):</div>
      <div className="bj-sw-c-row">{state.you.map((c, i) => <div key={i} className={`bj-sw-c-card ${isRed(c) ? "red" : "black"}`}>{cardName(c)}</div>)}</div>
      {state.phase === "play" && <div className="bj-sw-c-actions">
        <button data-testid="hint-target-blackjack-switch-cas-hit" className="bj-sw-c-btn" onClick={() => dispatch({ type: "hit" } as BlackjackSwitchCasAction)}>Hit</button>
        <button data-testid="hint-target-blackjack-switch-cas-stand" className="bj-sw-c-btn alt" onClick={() => dispatch({ type: "stand" } as BlackjackSwitchCasAction)}>Stand</button>
        {state.you.length === 2 && <button className="bj-sw-c-btn alt" onClick={() => dispatch({ type: "double" } as BlackjackSwitchCasAction)}>Double</button>}
        {SURRENDER_ENABLED && state.you.length === 2 && <button className="bj-sw-c-btn alt" onClick={() => dispatch({ type: "surrender" } as BlackjackSwitchCasAction)}>Surrender</button>}
      </div>}
      {state.phase === "scored" && <>
        <div className="bj-sw-c-result">{state.result} — +{state.pts}</div>
        <button data-testid="hint-target-blackjack-switch-cas-next" className="bj-sw-c-btn alt" onClick={() => dispatch({ type: "next" } as BlackjackSwitchCasAction)}>Next</button>
      </>}
    </div>
  );
}
