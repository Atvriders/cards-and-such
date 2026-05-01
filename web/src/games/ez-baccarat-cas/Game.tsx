import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { EzBaccaratCasState, EzBaccaratCasAction, EzBaccaratCasSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS, cardName, isRed } from "./state.js";
import "./Game.css";

export function EzBaccaratCasGame({ state, dispatch, onGameOver }: GameProps<EzBaccaratCasState, EzBaccaratCasSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") return <div className="ez-b-c-wrap"><div className="ez-b-c-done"><h2>Done!</h2><div className="ez-b-c-final">{state.score} pts</div></div></div>;
  return (
    <div className="ez-b-c-wrap">
      <div className="ez-b-c-title">EZ Baccarat</div>
      <div className="ez-b-c-info">Round {state.round} / {TOTAL_ROUNDS}</div>
      <div className="ez-b-c-score">{state.score} pts</div>
      {state.phase === "bet" && (
        <>
          <div className="ez-b-c-info">Place your bet:</div>
          <div className="ez-b-c-actions">
            <button className="ez-b-c-btn" onClick={() => dispatch({ type: "bet", on: "player" } as EzBaccaratCasAction)}>Player (20 pts)</button>
            <button className="ez-b-c-btn" onClick={() => dispatch({ type: "bet", on: "banker" } as EzBaccaratCasAction)}>Banker (20 pts)</button>
            <button className="ez-b-c-btn alt" onClick={() => dispatch({ type: "bet", on: "tie" } as EzBaccaratCasAction)}>Tie (80 pts)</button>
          </div>
        </>
      )}
      {state.phase === "scored" && (
        <>
          <div className="ez-b-c-info">Player ({state.pTotal}):</div>
          <div className="ez-b-c-row">{state.player.map((c, i) => <div key={i} className={`ez-b-c-card ${isRed(c) ? "red" : "black"}`}>{cardName(c)}</div>)}</div>
          <div className="ez-b-c-info">Banker ({state.bTotal}):</div>
          <div className="ez-b-c-row">{state.banker.map((c, i) => <div key={i} className={`ez-b-c-card ${isRed(c) ? "red" : "black"}`}>{cardName(c)}</div>)}</div>
          <div className="ez-b-c-result">{state.result}</div>
          <button className="ez-b-c-btn alt" onClick={() => dispatch({ type: "next" } as EzBaccaratCasAction)}>Next</button>
        </>
      )}
    </div>
  );
}
