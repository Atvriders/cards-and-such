import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { RedDogCasState, RedDogCasAction, RedDogCasSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS, cardName, isRed } from "./state.js";
import "./Game.css";
export function RedDogCasGame({ state, dispatch, onGameOver }: GameProps<RedDogCasState, RedDogCasSettings>): JSX.Element {
  const t = isTerminal(state); useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") return <div className="rd-c-wrap"><h3>Red Dog (Casino)</h3><div className="rd-c-done"><h2>Done!</h2><div className="rd-c-final">{state.score} pts</div></div></div>;
  return (
    <div className="rd-c-wrap">
      <h3>Red Dog (Casino)</h3>
      <div className="rd-c-info">Round {state.round} / {TOTAL_ROUNDS}</div>
      <div className="rd-c-score">{state.score} pts</div>
      {state.cardA !== null && state.cardB !== null && state.cardC !== null && (
        <div className="rd-c-row">
          <div className={`rd-c-card ${isRed(state.cardA) ? "red" : "black"}`}>{cardName(state.cardA)}</div>
          <div className={`rd-c-card ${isRed(state.cardB) ? "red" : "black"}`}>{cardName(state.cardB)}</div>
          <div className={`rd-c-card ${isRed(state.cardC) ? "red" : "black"}`}>{cardName(state.cardC)}</div>
        </div>
      )}
      {state.phase === "ready" && <button data-testid="hint-target-red-dog-cas-primary" className="rd-c-btn" onClick={() => dispatch({ type: "play" } as RedDogCasAction)}>Play</button>}
      {state.phase === "scored" && <>
        <div className="rd-c-result">{state.result}</div>
        <button data-testid="hint-target-red-dog-cas-secondary" className="rd-c-btn alt" onClick={() => dispatch({ type: "next" } as RedDogCasAction)}>Next</button>
      </>}
    </div>
  );
}
