import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { UltimateTexasCasState, UltimateTexasCasAction, UltimateTexasCasSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS, cardName, isRed } from "./state.js";
import "./Game.css";
export function UltimateTexasCasGame({ state, dispatch, onGameOver }: GameProps<UltimateTexasCasState, UltimateTexasCasSettings>): JSX.Element {
  const t = isTerminal(state); useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") return <div className="uth-c-wrap"><h3>Ultimate Texas Hold'em (Casino)</h3><div className="uth-c-done"><h2>Done!</h2><div className="uth-c-final">{state.score} pts</div></div></div>;
  return (
    <div className="uth-c-wrap">
      <h3>Ultimate Texas Hold'em (Casino)</h3>
      <div className="uth-c-info">Round {state.round} / {TOTAL_ROUNDS}</div>
      <div className="uth-c-score">{state.score} pts</div>
      {state.cardA !== null && state.cardB !== null && state.cardC !== null && (
        <div className="uth-c-row">
          <div className={`uth-c-card ${isRed(state.cardA) ? "red" : "black"}`}>{cardName(state.cardA)}</div>
          <div className={`uth-c-card ${isRed(state.cardB) ? "red" : "black"}`}>{cardName(state.cardB)}</div>
          <div className={`uth-c-card ${isRed(state.cardC) ? "red" : "black"}`}>{cardName(state.cardC)}</div>
        </div>
      )}
      {state.phase === "ready" && <button data-testid="hint-target-ultimate-texas-cas-primary" className="uth-c-btn" onClick={() => dispatch({ type: "play" } as UltimateTexasCasAction)}>Play</button>}
      {state.phase === "scored" && <>
        <div className="uth-c-result">{state.result}</div>
        <button className="uth-c-btn alt" onClick={() => dispatch({ type: "next" } as UltimateTexasCasAction)}>Next</button>
      </>}
    </div>
  );
}
