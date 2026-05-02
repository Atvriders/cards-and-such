import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { LetItRideCasState, LetItRideCasAction, LetItRideCasSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS, cardName, isRed } from "./state.js";
import "./Game.css";
export function LetItRideCasGame({ state, dispatch, onGameOver }: GameProps<LetItRideCasState, LetItRideCasSettings>): JSX.Element {
  const t = isTerminal(state); useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") return <div className="lir-c-wrap"><h3>Let It Ride (Casino)</h3><div className="lir-c-done"><h2>Done!</h2><div className="lir-c-final">{state.score} pts</div></div></div>;
  return (
    <div className="lir-c-wrap">
      <h3>Let It Ride (Casino)</h3>
      <div className="lir-c-info">Round {state.round} / {TOTAL_ROUNDS}</div>
      <div className="lir-c-score">{state.score} pts</div>
      {state.cardA !== null && state.cardB !== null && state.cardC !== null && (
        <div className="lir-c-row">
          <div className={`lir-c-card ${isRed(state.cardA) ? "red" : "black"}`}>{cardName(state.cardA)}</div>
          <div className={`lir-c-card ${isRed(state.cardB) ? "red" : "black"}`}>{cardName(state.cardB)}</div>
          <div className={`lir-c-card ${isRed(state.cardC) ? "red" : "black"}`}>{cardName(state.cardC)}</div>
        </div>
      )}
      {state.phase === "ready" && <button data-testid="hint-target-let-it-ride-cas-primary" className="lir-c-btn" onClick={() => dispatch({ type: "play" } as LetItRideCasAction)}>Play</button>}
      {state.phase === "scored" && <>
        <div className="lir-c-result">{state.result}</div>
        <button className="lir-c-btn alt" onClick={() => dispatch({ type: "next" } as LetItRideCasAction)}>Next</button>
      </>}
    </div>
  );
}
