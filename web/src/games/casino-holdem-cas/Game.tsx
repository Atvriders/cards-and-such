import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { CasinoHoldemCasState, CasinoHoldemCasAction, CasinoHoldemCasSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS, cardName, isRed } from "./state.js";
import "./Game.css";
export function CasinoHoldemCasGame({ state, dispatch, onGameOver }: GameProps<CasinoHoldemCasState, CasinoHoldemCasSettings>): JSX.Element {
  const t = isTerminal(state); useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") return <div className="ch-c-wrap"><h3>Casino Hold'em (Casino)</h3><div className="ch-c-done"><h2>Done!</h2><div className="ch-c-final">{state.score} pts</div></div></div>;
  return (
    <div className="ch-c-wrap">
      <h3>Casino Hold'em (Casino)</h3>
      <div className="ch-c-info">Round {state.round} / {TOTAL_ROUNDS}</div>
      <div className="ch-c-score">{state.score} pts</div>
      {state.cardA !== null && state.cardB !== null && state.cardC !== null && (
        <div className="ch-c-row">
          <div className={`ch-c-card ${isRed(state.cardA) ? "red" : "black"}`}>{cardName(state.cardA)}</div>
          <div className={`ch-c-card ${isRed(state.cardB) ? "red" : "black"}`}>{cardName(state.cardB)}</div>
          <div className={`ch-c-card ${isRed(state.cardC) ? "red" : "black"}`}>{cardName(state.cardC)}</div>
        </div>
      )}
      {state.phase === "ready" && <button data-testid="hint-target-casino-holdem-cas-primary" className="ch-c-btn" onClick={() => dispatch({ type: "play" } as CasinoHoldemCasAction)}>Play</button>}
      {state.phase === "scored" && <>
        <div className="ch-c-result">{state.result}</div>
        <button className="ch-c-btn alt" onClick={() => dispatch({ type: "next" } as CasinoHoldemCasAction)}>Next</button>
      </>}
    </div>
  );
}
