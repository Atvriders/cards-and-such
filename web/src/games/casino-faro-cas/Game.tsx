import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { CasState, CasAction, CasSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS, cardName, isRed } from "./state.js";
import "./Game.css";

export function CasGame({ state, dispatch, onGameOver }: GameProps<CasState, CasSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") return <div className="fr-c-wrap"><h3>Casino Faro</h3><div className="fr-c-done"><h2>Done!</h2><div className="fr-c-final">{state.score} pts</div></div></div>;
  return (
    <div className="fr-c-wrap">
      <h3>Casino Faro</h3>
      <div className="fr-c-info">Round {state.round} / {TOTAL_ROUNDS}</div>
      <div className="fr-c-score">{state.score} pts</div>
      {state.cardA !== null && state.cardB !== null && state.cardC !== null && (
        <div className="fr-c-row">
          <div className={`fr-c-card ${isRed(state.cardA) ? "red" : "black"}`}>{cardName(state.cardA)}</div>
          <div className={`fr-c-card ${isRed(state.cardB) ? "red" : "black"}`}>{cardName(state.cardB)}</div>
          <div className={`fr-c-card ${isRed(state.cardC) ? "red" : "black"}`}>{cardName(state.cardC)}</div>
        </div>
      )}
      {state.phase === "ready" && <button data-testid="hint-target-casino-faro-cas-primary" className="fr-c-btn" onClick={() => dispatch({ type: "play" } as CasAction)}>Play</button>}
      {state.phase === "scored" && <>
        <div className="fr-c-result">{state.result}</div>
        <button data-testid="hint-target-casino-faro-cas-secondary" className="fr-c-btn alt" onClick={() => dispatch({ type: "next" } as CasAction)}>Next</button>
      </>}
    </div>
  );
}
