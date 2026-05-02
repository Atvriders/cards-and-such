import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { Spanish21CasState, Spanish21CasAction, Spanish21CasSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS, cardName, isRed } from "./state.js";
import "./Game.css";

const SURRENDER_ENABLED = true;
export function Spanish21CasGame({ state, dispatch, onGameOver }: GameProps<Spanish21CasState, Spanish21CasSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") return <div className="sp21-c-wrap"><div className="sp21-c-done"><h2>Done!</h2><div className="sp21-c-final">{state.score} pts</div></div></div>;
  const showDealer = state.phase !== "play";
  return (
    <div className="sp21-c-wrap">
      <div className="sp21-c-title">Spanish 21</div>
      <div className="sp21-c-info">Round {state.round} / {TOTAL_ROUNDS}</div>
      <div className="sp21-c-score">{state.score} pts</div>
      <div className="sp21-c-info">Dealer ({showDealer ? state.dealerTotal : "?"}):</div>
      <div className="sp21-c-row">
        {state.dealer.map((c, i) => (i === 1 && !showDealer)
          ? <div key={i} className="sp21-c-card back">??</div>
          : <div key={i} className={`sp21-c-card ${isRed(c) ? "red" : "black"}`}>{cardName(c)}</div>)}
      </div>
      <div className="sp21-c-info">You ({state.yourTotal}):</div>
      <div className="sp21-c-row">{state.you.map((c, i) => <div key={i} className={`sp21-c-card ${isRed(c) ? "red" : "black"}`}>{cardName(c)}</div>)}</div>
      {state.phase === "play" && <div className="sp21-c-actions">
        <button data-testid="hint-target-spanish-21-cas-primary" className="sp21-c-btn" onClick={() => dispatch({ type: "hit" } as Spanish21CasAction)}>Hit</button>
        <button className="sp21-c-btn alt" onClick={() => dispatch({ type: "stand" } as Spanish21CasAction)}>Stand</button>
        {state.you.length === 2 && <button className="sp21-c-btn alt" onClick={() => dispatch({ type: "double" } as Spanish21CasAction)}>Double</button>}
        {SURRENDER_ENABLED && state.you.length === 2 && <button className="sp21-c-btn alt" onClick={() => dispatch({ type: "surrender" } as Spanish21CasAction)}>Surrender</button>}
      </div>}
      {state.phase === "scored" && <>
        <div className="sp21-c-result">{state.result} — +{state.pts}</div>
        <button className="sp21-c-btn alt" onClick={() => dispatch({ type: "next" } as Spanish21CasAction)}>Next</button>
      </>}
    </div>
  );
}
