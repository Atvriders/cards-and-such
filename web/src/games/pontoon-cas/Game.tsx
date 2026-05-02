import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { PontoonCasState, PontoonCasAction, PontoonCasSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS, cardName, isRed } from "./state.js";
import "./Game.css";

const SURRENDER_ENABLED = false;
export function PontoonCasGame({ state, dispatch, onGameOver }: GameProps<PontoonCasState, PontoonCasSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") return <div className="pon-c-wrap"><div className="pon-c-done"><h2>Done!</h2><div className="pon-c-final">{state.score} pts</div></div></div>;
  const showDealer = state.phase !== "play";
  return (
    <div className="pon-c-wrap">
      <div className="pon-c-title">Pontoon</div>
      <div className="pon-c-info">Round {state.round} / {TOTAL_ROUNDS}</div>
      <div className="pon-c-score">{state.score} pts</div>
      <div className="pon-c-info">Dealer ({showDealer ? state.dealerTotal : "?"}):</div>
      <div className="pon-c-row">
        {state.dealer.map((c, i) => (i === 1 && !showDealer)
          ? <div key={i} className="pon-c-card back">??</div>
          : <div key={i} className={`pon-c-card ${isRed(c) ? "red" : "black"}`}>{cardName(c)}</div>)}
      </div>
      <div className="pon-c-info">You ({state.yourTotal}):</div>
      <div className="pon-c-row">{state.you.map((c, i) => <div key={i} className={`pon-c-card ${isRed(c) ? "red" : "black"}`}>{cardName(c)}</div>)}</div>
      {state.phase === "play" && <div className="pon-c-actions">
        <button data-testid="hint-target-pontoon-cas-primary" className="pon-c-btn" onClick={() => dispatch({ type: "hit" } as PontoonCasAction)}>Hit</button>
        <button className="pon-c-btn alt" onClick={() => dispatch({ type: "stand" } as PontoonCasAction)}>Stand</button>
        {state.you.length === 2 && <button className="pon-c-btn alt" onClick={() => dispatch({ type: "double" } as PontoonCasAction)}>Double</button>}
        {SURRENDER_ENABLED && state.you.length === 2 && <button className="pon-c-btn alt" onClick={() => dispatch({ type: "surrender" } as PontoonCasAction)}>Surrender</button>}
      </div>}
      {state.phase === "scored" && <>
        <div className="pon-c-result">{state.result} — +{state.pts}</div>
        <button className="pon-c-btn alt" onClick={() => dispatch({ type: "next" } as PontoonCasAction)}>Next</button>
      </>}
    </div>
  );
}
