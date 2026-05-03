import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { BanqueCasState, BanqueCasAction, BanqueCasSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS, cardName, isRed } from "./state.js";
import "./Game.css";

export function BanqueCasGame({ state, dispatch, onGameOver }: GameProps<BanqueCasState, BanqueCasSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") return <div className="banq-c-wrap"><div className="banq-c-done"><h2>Done!</h2><div className="banq-c-final">{state.score} pts</div></div></div>;
  return (
    <div className="banq-c-wrap">
      <div className="banq-c-title">Baccarat Banque</div>
      <div className="banq-c-info">Round {state.round} / {TOTAL_ROUNDS}</div>
      <div className="banq-c-score">{state.score} pts</div>
      {state.phase === "bet" && (
        <>
          <div className="banq-c-info">Place your bet:</div>
          <div className="banq-c-actions">
            <button data-testid="hint-target-banque-cas-primary" className="banq-c-btn" onClick={() => dispatch({ type: "bet", on: "player" } as BanqueCasAction)}>Player (20 pts)</button>
            <button className="banq-c-btn" onClick={() => dispatch({ type: "bet", on: "banker" } as BanqueCasAction)}>Banker (19 pts)</button>
            <button className="banq-c-btn alt" onClick={() => dispatch({ type: "bet", on: "tie" } as BanqueCasAction)}>Tie (80 pts)</button>
          </div>
        </>
      )}
      {state.phase === "scored" && (
        <>
          <div className="banq-c-info">Player ({state.pTotal}):</div>
          <div className="banq-c-row">{state.player.map((c, i) => <div key={i} className={`banq-c-card ${isRed(c) ? "red" : "black"}`}>{cardName(c)}</div>)}</div>
          <div className="banq-c-info">Banker ({state.bTotal}):</div>
          <div className="banq-c-row">{state.banker.map((c, i) => <div key={i} className={`banq-c-card ${isRed(c) ? "red" : "black"}`}>{cardName(c)}</div>)}</div>
          <div className="banq-c-result">{state.result}</div>
          <button data-testid="hint-target-banque-cas-secondary" className="banq-c-btn alt" onClick={() => dispatch({ type: "next" } as BanqueCasAction)}>Next</button>
        </>
      )}
    </div>
  );
}
