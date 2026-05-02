import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { CheminDeFerCasState, CheminDeFerCasAction, CheminDeFerCasSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS, cardName, isRed } from "./state.js";
import "./Game.css";

export function CheminDeFerCasGame({ state, dispatch, onGameOver }: GameProps<CheminDeFerCasState, CheminDeFerCasSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") return <div className="cdf-c-wrap"><div className="cdf-c-done"><h2>Done!</h2><div className="cdf-c-final">{state.score} pts</div></div></div>;
  return (
    <div className="cdf-c-wrap">
      <div className="cdf-c-title">Chemin de Fer</div>
      <div className="cdf-c-info">Round {state.round} / {TOTAL_ROUNDS}</div>
      <div className="cdf-c-score">{state.score} pts</div>
      {state.phase === "bet" && (
        <>
          <div className="cdf-c-info">Place your bet:</div>
          <div className="cdf-c-actions">
            <button data-testid="hint-target-chemin-de-fer-cas-primary" className="cdf-c-btn" onClick={() => dispatch({ type: "bet", on: "player" } as CheminDeFerCasAction)}>Player (20 pts)</button>
            <button className="cdf-c-btn" onClick={() => dispatch({ type: "bet", on: "banker" } as CheminDeFerCasAction)}>Banker (19 pts)</button>
            <button className="cdf-c-btn alt" onClick={() => dispatch({ type: "bet", on: "tie" } as CheminDeFerCasAction)}>Tie (80 pts)</button>
          </div>
        </>
      )}
      {state.phase === "scored" && (
        <>
          <div className="cdf-c-info">Player ({state.pTotal}):</div>
          <div className="cdf-c-row">{state.player.map((c, i) => <div key={i} className={`cdf-c-card ${isRed(c) ? "red" : "black"}`}>{cardName(c)}</div>)}</div>
          <div className="cdf-c-info">Banker ({state.bTotal}):</div>
          <div className="cdf-c-row">{state.banker.map((c, i) => <div key={i} className={`cdf-c-card ${isRed(c) ? "red" : "black"}`}>{cardName(c)}</div>)}</div>
          <div className="cdf-c-result">{state.result}</div>
          <button className="cdf-c-btn alt" onClick={() => dispatch({ type: "next" } as CheminDeFerCasAction)}>Next</button>
        </>
      )}
    </div>
  );
}
