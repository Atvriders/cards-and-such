import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { MiniBaccaratCasState, MiniBaccaratCasAction, MiniBaccaratCasSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS, cardName, isRed } from "./state.js";
import "./Game.css";

export function MiniBaccaratCasGame({ state, dispatch, onGameOver }: GameProps<MiniBaccaratCasState, MiniBaccaratCasSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") return <div className="mb-c-wrap"><div className="mb-c-done"><h2>Done!</h2><div className="mb-c-final">{state.score} pts</div></div></div>;
  return (
    <div className="mb-c-wrap">
      <div className="mb-c-title">Mini Baccarat</div>
      <div className="mb-c-info">Round {state.round} / {TOTAL_ROUNDS}</div>
      <div className="mb-c-score">{state.score} pts</div>
      {state.phase === "bet" && (
        <>
          <div className="mb-c-info">Place your bet:</div>
          <div className="mb-c-actions">
            <button data-testid="hint-target-mini-baccarat-cas-primary" className="mb-c-btn" onClick={() => dispatch({ type: "bet", on: "player" } as MiniBaccaratCasAction)}>Player (20 pts)</button>
            <button className="mb-c-btn" onClick={() => dispatch({ type: "bet", on: "banker" } as MiniBaccaratCasAction)}>Banker (19 pts)</button>
            <button className="mb-c-btn alt" onClick={() => dispatch({ type: "bet", on: "tie" } as MiniBaccaratCasAction)}>Tie (80 pts)</button>
          </div>
        </>
      )}
      {state.phase === "scored" && (
        <>
          <div className="mb-c-info">Player ({state.pTotal}):</div>
          <div className="mb-c-row">{state.player.map((c, i) => <div key={i} className={`mb-c-card ${isRed(c) ? "red" : "black"}`}>{cardName(c)}</div>)}</div>
          <div className="mb-c-info">Banker ({state.bTotal}):</div>
          <div className="mb-c-row">{state.banker.map((c, i) => <div key={i} className={`mb-c-card ${isRed(c) ? "red" : "black"}`}>{cardName(c)}</div>)}</div>
          <div className="mb-c-result">{state.result}</div>
          <button className="mb-c-btn alt" onClick={() => dispatch({ type: "next" } as MiniBaccaratCasAction)}>Next</button>
        </>
      )}
    </div>
  );
}
