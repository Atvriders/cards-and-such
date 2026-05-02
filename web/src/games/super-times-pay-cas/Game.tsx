import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { SuperTimesPayCasState, SuperTimesPayCasAction, SuperTimesPayCasSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS, cardName, isRed } from "./state.js";
import "./Game.css";
export function SuperTimesPayCasGame({ state, dispatch, onGameOver }: GameProps<SuperTimesPayCasState, SuperTimesPayCasSettings>): JSX.Element {
  const t = isTerminal(state); useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") return <div className="dm-wrap"><h3>Super Times Pay</h3><div className="dm-done"><h2>Done!</h2><div className="dm-final">{state.score} pts</div></div></div>;
  return (
    <div className="dm-wrap">
      <h3>Super Times Pay</h3>
      <div className="dm-info">Round {state.round} / {TOTAL_ROUNDS}</div>
      <div className="dm-score">{state.score} pts</div>
      {state.cardA !== null && state.cardB !== null && state.cardC !== null && (
        <div className="dm-row">
          <div className={`dm-card ${isRed(state.cardA) ? "red" : "black"}`}>{cardName(state.cardA)}</div>
          <div className={`dm-card ${isRed(state.cardB) ? "red" : "black"}`}>{cardName(state.cardB)}</div>
          <div className={`dm-card ${isRed(state.cardC) ? "red" : "black"}`}>{cardName(state.cardC)}</div>
        </div>
      )}
      {state.phase === "ready" && <button data-testid="hint-target-super-times-pay-cas-primary" className="dm-btn" onClick={() => dispatch({ type: "play" } as SuperTimesPayCasAction)}>Play</button>}
      {state.phase === "scored" && <>
        <div className="dm-result">{state.result}</div>
        <button className="dm-btn alt" onClick={() => dispatch({ type: "next" } as SuperTimesPayCasAction)}>Next</button>
      </>}
    </div>
  );
}
