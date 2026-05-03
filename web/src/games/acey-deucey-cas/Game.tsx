import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { AceyDeuceyCasState, AceyDeuceyCasAction, AceyDeuceyCasSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS, cardName, isRed } from "./state.js";
import "./Game.css";
export function AceyDeuceyCasGame({ state, dispatch, onGameOver }: GameProps<AceyDeuceyCasState, AceyDeuceyCasSettings>): JSX.Element {
  const t = isTerminal(state); useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") return <div className="dm-wrap adc-wrap"><div className="dm-done"><h2>Done!</h2><div className="dm-final">{state.score} pts</div></div></div>;
  return (
    <div className="dm-wrap adc-wrap">
      <div className="dm-info">Round {state.round} / {TOTAL_ROUNDS}</div>
      <div className="dm-score">{state.score} pts</div>
      <div className="dm-row">
        {state.left !== null ? <div className={`dm-card ${isRed(state.left) ? "red" : "black"}`}>{cardName(state.left)}</div> : <div className="dm-card">?</div>}
        {state.middle !== null ? <div className={`dm-card ${isRed(state.middle) ? "red" : "black"}`}>{cardName(state.middle)}</div> : <div className="dm-card">?</div>}
        {state.right !== null ? <div className={`dm-card ${isRed(state.right) ? "red" : "black"}`}>{cardName(state.right)}</div> : <div className="dm-card">?</div>}
      </div>
      {state.phase === "ready" && <button data-testid="hint-target-acey-deucey-cas-primary" className="dm-btn" onClick={() => dispatch({ type: "play" } as AceyDeuceyCasAction)}>Deal</button>}
      {state.phase === "scored" && <>
        <div className="dm-result">{state.result}</div>
        <button data-testid="hint-target-acey-deucey-cas-secondary" className="dm-btn alt" onClick={() => dispatch({ type: "next" } as AceyDeuceyCasAction)}>Next</button>
      </>}
    </div>
  );
}
